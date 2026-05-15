const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const { pool } = require("../config/database");
const { registrarAuditoria } = require("../utils/auditoria");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");

require("dotenv").config();

const router = express.Router();

const ldapUrl = process.env.LDAP_URL;
const baseDN = process.env.LDAP_DN;

function autenticarLDAP(username, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapUrl,
      //     ,
      // tlsOptions: {
      //   rejectUnauthorized: false // solo para pruebas
      // }
    });
    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    client.on("error", (err) => {
      console.error("Error de conexión:", err);
    });

    client.bind(serviceUser, servicePass, (err) => {
      if (err) {
        client.unbind();
        return reject({
          type: "LDAP_CONN",
          message: "Error conectando a LDAP",
        });
      }

      const opts = {
        filter: `(sAMAccountName=${username})`,
        scope: "sub",
        attributes: [
          "dn",
          "cn",
          "displayName",
          "mail",
          "sAMAccountName",
          "memberOf",
          "employeeID",
        ],
      };

      client.search(
        baseDN || "dc=ldap,dc=pruebaitp,dc=com",
        opts,
        (err, res) => {
          //modificar y agregar baseDN en el string y eliminar string
          if (err) {
            client.unbind();
            return reject({
              type: "LDAP_SEARCH",
              message: "Error buscando usuario LDAP",
            });
          }

          let userDN = null;
          let userData = [];

          res.on("searchEntry", (entry) => {
            userDN = entry.pojo.objectName;
            entry.pojo.attributes.forEach((attr) => {
              // if (attr.type === "memberOf") {
              //   const grupos = attr.values.map((g) => {
              //     const match = g.match(/CN=([^,]+)/);
              //     return match ? match[1].toLowerCase() : g.toLowerCase();
              //   });

              //   userData.memberOf = grupos;
              //   

              //   if (grupos.includes("admin-cola")) {
              //     userData.rol = "admin";
              //   } else if (grupos.includes("operador-cola")) {
              //     userData.rol = "operador";
              //   } else {
              //     userData.rol = "usuario-ldap";
              //   }

              //   return;
              // }

              userData[attr.type] =
                attr.values.length === 1 ? attr.values[0] : attr.values;
            });

            
          });

          res.on("error", () => {
            client.unbind();
            reject({ type: "LDAP_RESPONSE", message: "Error respuesta LDAP" });
          });

          res.on("end", () => {
            if (!userDN) {
              client.unbind();
              return reject({ type: "NOT_IN_LDAP" });
            }

            client.bind(userDN, password, (err) => {
              client.unbind();

              if (err) {
                return reject({ type: "BAD_PASSWORD" });
              }

              resolve(userData);
            });
          });
        },
      );
    });
  });
}

function ValidarLDAP(username) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: ldapUrl });

    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    client.bind(serviceUser, servicePass, (err) => {
      if (err) {
        client.unbind();
        return reject({
          type: "LDAP_CONN",
          message: "Error",
        });
      }
      const opts = {
        filter: `(employeeID=${username})`,
        scope: "sub",
        attributes: ["dn", "cn", "displayName", "employeeID"],
      };
      client.search(
        baseDN || "dc=ldap,dc=pruebaitp,dc=com",
        opts,
        (err, res) => {
          if (err) {
            client.unbind();
            return reject({
              type: "LDAP_SEARCH",
              message: "Error",
            });
          }

          let userDN = null;
          let userData = {};

          res.on("searchEntry", (entry) => {
            userDN = entry.pojo.objectName;

            entry.pojo.attributes.forEach((attr) => {
              userData[attr.type] =
                attr.values.length === 1 ? attr.values[0] : attr.values;
            });
          });

          res.on("error", () => {
            client.unbind();
            reject({ type: "LDAP_RESPONSE", message: "Error" });
          });

          res.on("end", () => {
            client.unbind();

            if (!userDN) {
              return reject({ type: "NOT_IN_LDAP" });
            }

            // Ya no validamos contraseña
            resolve(userData);
          });
        },
      );
    });
  });
}

router.post("/verificar", async (req, res) => {
  try {
    const { username } = req.body;

    // Validación básica
    if (!username) {
      return res.status(400).json({
        ok: false,
        message: "El ID es requerido",
      });
    }

    

    const usuario = await ValidarLDAP(username);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado en LDAP",
      });
    }

    await pool.query(
      `INSERT INTO persona (id_persona, name) 
   VALUES (?, ?)
   ON DUPLICATE KEY UPDATE 
   name = VALUES(name)`,
      [usuario.employeeID, usuario.cn || usuario.displayName],
    );

    return res.status(200).json({
      ok: true,
      message: "Usuario encontrado",
      data: usuario,
    });
  } catch (error) {
    console.error("Error en /verificar:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1️⃣ Autenticación LDAP
    const ldapUser = await autenticarLDAP(username, password);

    if (!ldapUser) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // 2️⃣ Normalizamos datos LDAP
    const userData = {
      username,
      nombre: ldapUser.displayName || ldapUser.cn,
      employeeID: ldapUser.employeeID,
    };

    // 3️⃣ Verificar si existe en DB (acceso permitido)
    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE username = ? AND id_persona = ?`,
      [username, userData.employeeID],
    );

    if (!rows.length) {
      // No tiene acceso → login fallido
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    const userDB = rows[0];

    // 4️⃣ Validaciones adicionales
    if (!userDB.activo) {
      return res.status(401).json({ error: "Usuario inactivo" });
    }

    if (userDB.rol !== 1 && (!userDB.puesto_id || userDB.puesto_id === "")) {
      return res.status(401).json({ error: "No tienes un puesto asignado" });
    }

    // 5️⃣ Generar token JWT
    const token = jwt.sign(
      {
        id: userDB.id,
        nombre: userDB.username,
        rol: userDB.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 6️⃣ Registrar auditoría
    await registrarAuditoria({
      usuarioId: userDB.id,
      accion: "INICIO DE SESIÓN",
      modulo: "Autenticación",
      detalles: `Usuario "${userDB.nombre}" inicia sesión`,
      req,
    });

    return res.json({
      success: true,
      user: userDB,
      token,
    });
  } catch (error) {
    await registrarAuditoria({
      usuarioId: username,
      accion: `LOGIN FALLIDO CON: ${username}`,
      detalles: "Error en autenticación",
      req,
    });

    console.error("LDAP error:", error.message);

    return res.status(401).json({
      error: "Usuario o contraseña incorrectos",
    });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.username, u.rol, u.puesto_id,
                       p.nombre as puesto_nombre,
              per.name as nombre
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       left JOIN persona per on u.id_persona = per.id_persona
       WHERE u.id = ?  and u.activo =1`,
      [req.user.id],
    );

     

    if (usuarios.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuarios[0].rol !== 1) {
      if (usuarios[0].puesto_id === null) {
        return res.status(404).json({ error: "Puesto no asignado" });
      }
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "error del servidor" });
  }
});

//VALIDACIONES CON SYCHRONOUS

function SyncLDAP() {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: ldapUrl });

    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    client.bind(serviceUser, servicePass, (err) => {
      if (err) {
        client.unbind();
        return reject({
          type: "LDAP_CONN",
          message: "Error",
        });
      }

      const opts = {
        filter: `(comment=cola)`,
        scope: "sub",
        attributes: [
          "sAMAccountName",
          "employeeType",
          "cn",
          "displayName",
          "employeeID",
        ],
      };

      client.search(
        //baseDN || "dc=ldap,dc=pruebaitp,dc=com",
        "dc=ldap,dc=pruebaitp,dc=com",
        opts,
        (err, res) => {
          if (err) {
            client.unbind();
            return reject({
              type: "LDAP_SEARCH",
              message: "Error",
            });
          }

          const users = [];

          res.on("searchEntry", (entry) => {
            const userData = {};

            userData.dn = entry.pojo.objectName;

            entry.pojo.attributes.forEach((attr) => {
              userData[attr.type] =
                attr.values.length === 1 ? attr.values[0] : attr.values;
            });

            users.push(userData);
          });

          res.on("error", (err) => {
            client.unbind();

            reject({
              type: "LDAP_RESPONSE",
              message: err.message,
            });
          });

          res.on("end", () => {
            client.unbind();

            resolve(users);
          });
        },
      );
    });
  });
}

router.post("/syncldap", async (req, res) => {
  try {
    const usuarios = await SyncLDAP();

   

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron usuarios en LDAP",
      });
    }

    // CONTADORES
    let personasCreadas = 0;
    let personasActualizadas = 0;
    let usuariosCreados = 0;

    for (const usuario of usuarios) {
      const emplid = usuario.employeeID;
      const nombreLDAP = usuario.cn || usuario.displayName;
      const emptype = usuario.employeeType;
      const username = usuario.sAMAccountName;

      if (!emplid || !username) continue;

      /*
       * =========================================
       * VALIDAR / CREAR PERSONA
       * =========================================
       */

      const [personaRows] = await pool.query(
        `SELECT id_persona, name
         FROM persona
         WHERE id_persona = ?`,
        [emplid],
      );

      // No existe -> insertar
      if (personaRows.length === 0) {
        await pool.query(
          `INSERT INTO persona (id_persona, name)
           VALUES (?, ?)`,
          [emplid, nombreLDAP],
        );

        personasCreadas++;

       
      } else {
        const personaDB = personaRows[0];

        // Existe pero nombre diferente -> actualizar
        if (personaDB.name !== nombreLDAP) {
          await pool.query(
            `UPDATE persona
             SET name = ?
             WHERE id_persona = ?`,
            [nombreLDAP, emplid],
          );

          personasActualizadas++;

          
        }
      }

      /*
       * =========================================
       * VALIDAR / CREAR USUARIO
       * =========================================
       */

      const [usuarioRows] = await pool.query(
        `SELECT id, username
   FROM usuarios
   WHERE id_persona = ?`,
        [emplid],
      );

      // Si NO existe en usuarios -> insertar
      if (usuarioRows.length === 0) {
        await pool.query(
          `INSERT INTO usuarios
     (id_persona, username, rol, puesto_id, activo, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            emplid,
            username,
            2, // rol
            null, // puesto_id
            1, // activo
          ],
        );

        usuariosCreados++;

        
      } else {
        const usuarioDB = usuarioRows[0];

        // Existe pero username diferente -> actualizar
        if (usuarioDB.username !== username) {
          await pool.query(
            `UPDATE usuarios
       SET username = ?
       WHERE id_persona = ?`,
            [username, emplid],
          );

          
        } else {
           
        }
      }
    }

    return res.json({
      ok: true,
      message: "Sincronización LDAP completada",
      data: {
        totalLDAP: usuarios.length,
        personasCreadas,
        personasActualizadas,
        usuariosCreados,
      },
    });
  } catch (error) {
    console.error("Error en /syncldap:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
});

// BÚSQUEDA DE USUARIOS LDAP
router.get("/ldap/search", async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 2) {
      return res.status(400).json({
        ok: false,
        message: "Ingresa al menos 2 caracteres",
      });
    }

    const client = ldap.createClient({ url: ldapUrl });
    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    return new Promise((resolve) => {
      client.bind(serviceUser, servicePass, (err) => {
        if (err) {
          client.unbind();
          return resolve(
            res.status(500).json({
              ok: false,
              message: "Error conectando a LDAP",
            }),
          );
        }

        const opts = {
          filter: `(sAMAccountName=*${username}*)`,
          scope: "sub",
          attributes: [
            "sAMAccountName",
            "cn",
            "displayName",
            "mail",
            "employeeID",
          ],
        };

        const users = [];

        client.search(
          baseDN || "dc=ldap,dc=pruebaitp,dc=com",
          opts,
          (err, res2) => {
            if (err) {
              client.unbind();
              return resolve(
                res.status(500).json({
                  ok: false,
                  message: "Error buscando en LDAP",
                }),
              );
            }

            res2.on("searchEntry", (entry) => {
              const userData = {};
              entry.pojo.attributes.forEach((attr) => {
                userData[attr.type] =
                  attr.values.length === 1 ? attr.values[0] : attr.values;
              });
              users.push(userData);
            });

            res2.on("end", () => {
              client.unbind();
              resolve(
                res.json({
                  ok: true,
                  data: users,
                }),
              );
            });

            res2.on("error", (e) => {
              client.unbind();
              resolve(
                res.status(500).json({
                  ok: false,
                  message: e.message,
                }),
              );
            });
          },
        );
      });
    });
  } catch (error) {
    console.error("Error en /ldap/search:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
});

// AGREGAR USUARIO LDAP A BD
router.post("/ldap/users/add", authenticateToken, async (req, res) => {
  try {
    const { sAMAccountName, employeeID, displayName } = req.body;

    if (!sAMAccountName || !employeeID) {
      return res.status(400).json({
        ok: false,
        message: "Datos incompletos",
      });
    }

    // Verificar si ya existe
    const [existing] = await pool.query(
      `SELECT id FROM usuarios WHERE id_persona = ? OR username = ?`,
      [employeeID, sAMAccountName],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya existe",
      });
    }

    // Agregar a tabla persona
    await pool.query(
      `INSERT INTO persona (id_persona, name) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [employeeID, displayName || sAMAccountName],
    );

    // Agregar a tabla usuarios
    await pool.query(
      `INSERT INTO usuarios (id_persona, username, rol, activo, created_at)
       VALUES (?, ?, ?, 1, NOW())`,
      [employeeID, sAMAccountName, 2],
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: "USUARIO LDAP AGREGADO",
      modulo: "Usuarios",
      detalles: `Usuario "${sAMAccountName}" agregado desde búsqueda LDAP`,
      req,
    });

    res.json({
      ok: true,
      message: "Usuario agregado exitosamente",
    });
  } catch (error) {
    console.error("Error en /ldap/users/add:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
});

module.exports = router;
