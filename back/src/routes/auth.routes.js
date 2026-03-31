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

      client.search(baseDN, opts, (err, res) => {
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
            if (attr.type === "memberOf") {
              const grupos = attr.values.map((g) => {
                const match = g.match(/CN=([^,]+)/);
                return match ? match[1].toLowerCase() : g.toLowerCase();
              });

              userData.memberOf = grupos;

              if (grupos.includes("admin-cola")) {
                userData.rol = "admin";
              } else if (grupos.includes("operador-cola")) {
                userData.rol = "operador";
              } else {
                userData.rol = "usuario-ldap";
              }

              return;
            }

            userData[attr.type] =
              attr.values.length === 1 ? attr.values[0] : attr.values;
          });

          console.log(userData, "user data ldap");
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
      });
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
      console.log("pass");
      const opts = {
        filter: `(employeeID=${username})`,
        scope: "sub",
        attributes: ["dn", "cn", "displayName", "employeeID"],
      };

      client.search(baseDN, opts, (err, res) => {
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
      });
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

    console.log("Validando: ", username);

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
    // 1️⃣ Autenticación SOLO con LDAP
    // console.log("ldapuser")
    const ldapUser = await autenticarLDAP(username, password);
    console.log("ldapuser", ldapUser);

    // let ldapUser = {
    //   displayName: username,
    // };

    if (!ldapUser) {
      return res.status(401).json({ error: "Credenciales inválidass" });
    }

    // Normalizamos datos LDAP
    const userData = {
      username,
      nombre: ldapUser.displayName || ldapUser.cn,
      rol: ldapUser.rol,
      employeeID: ldapUser.employeeID,
      activo: true,
      user_active: true,
    };

    console.log(username);

    // const userData = {
    //   username,
    //   nombre: username==='wluciano'? "12345678":"87654321",
    //   rol: username==='juan' || username==='maria' ? "operador" : "admin",
    //   activo: true
    // };
    // console.log(userData,"data user -------------")

    // 2️⃣ Verificar si existe en DB
    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE username = ?`,
      [username],
    );

    let userDB;
    let role = userData.rol == "admin" ? 1 : 2;
    console.log("loginnnnn");
    if (!rows.length) {
      // 3️⃣ No existe → CREARLO

      console.log("creando user:", userData);
      await pool.query(`INSERT INTO persona(id_persona, name) VALUES (?,?)`, [
        userData.employeeID,
        userData.nombre,
      ]);
      console.log("logged");

      if (userData.rol) {
        console.log("logged2");
        const [insertResult] = await pool.query(
          `INSERT INTO usuarios 
        (username, id_persona, rol,  activo)
        VALUES (?, ?, ?, ?)`,
          [userData.username, userData.employeeID, role, userData.activo],
        );

        userDB = {
          id: insertResult.insertId,
          ...userData,
        };
      }
    } else {
      // 4️⃣ Existe → ACTUALIZAR si cambió algo (ej: rol)
      const existingUser = rows[0];
      console.log(
        "actualizando user3",
        userData.nombre,
        role,
        existingUser.id,
        userData.employeeID,
      );
      await pool.query(
        `UPDATE usuarios 
         SET id_persona = ?, rol = ?
         WHERE id = ?`,
        [userData.employeeID, role, existingUser.id],
      );
      console.log("actualizando user pass");

      userDB = {
        ...existingUser,
        ...userData,
      };

      if (existingUser.active) {
        return res.status(401).json({
          error: "Usuario inactivo c.",
        });
      }
    }

    if (userDB.rol !== "admin") {
      if (userDB.puesto_id == null || userDB.puesto_id === "") {
        return res.status(401).json({
          error: "No tienes un puesto asignado.",
        });
      }
    }

    const token = jwt.sign(
      {
        id: userDB.id,
        nombre: userDB.username,
        rol: userDB.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // await registrarAuditoria({
    //   usuarioId: userDB.id,
    //   accion: 1, // 1 es para login
    //   modulo: "Autenticación",
    //   detalles: `Usuario LDAP "${userDB.nombre}" inicia sesión`,
    //   req,
    // });

    return res.json({
      success: true,
      user: userDB,
      token,
    });
  } catch (error) {
    // await registrarAuditoria({
    //   usuarioId: username,
    //   accion: "LOGIN FALLIDO",
    //   modulo: "Autenticación",
    //   detalles: "Error en autenticación LDAP",
    //   req,
    // });

    console.error("LDAP error:", error.message);

    return res.status(401).json({
      error: "Credenciales inválidas",
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

    console.log("userdb", usuarios[0]);

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

module.exports = router;
