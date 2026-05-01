const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ldap = require("ldapjs");
const { pool } = require("../config/database");
const { registrarAuditoria } = require("../utils/auditoria");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");
const { sendError, sendSuccess, asyncHandler } = require("../utils/errorHandler");
const { validateRequired } = require("../utils/validator");

require("dotenv").config();

const router = express.Router();

const ldapUrl = process.env.LDAP_URL;
const baseDN = process.env.LDAP_DN;

function autenticarLDAP(username, password) {
  
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: ldapUrl
    });
    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    client.on("error", (err) => {
      console.error("LDAP connection error:", err);
    });

    client.bind(serviceUser, servicePass, (err) => {
      if (err) {
        client.unbind();
        return reject({
          type: "LDAP_CONN",
          message: "Error connecting to LDAP",
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

      client.search(baseDN || 'dc=ldap,dc=pruebaitp,dc=com', opts, (err, res) => {
        if (err) {
          client.unbind();
          return reject({
            type: "LDAP_SEARCH",
            message: "Error searching user in LDAP",
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
        });

        res.on("error", () => {
          client.unbind();
          reject({ type: "LDAP_RESPONSE", message: "Error in LDAP response" });
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
          message: "Error connecting to LDAP",
        });
      }

      const opts = {
        filter: `(employeeID=${username})`,
        scope: "sub",
        attributes: ["dn", "cn", "displayName", "employeeID"],
      };

      client.search(baseDN || "dc=ldap,dc=pruebaitp,dc=com", opts, (err, res) => {
        if (err) {
          client.unbind();
          return reject({
            type: "LDAP_SEARCH",
            message: "Error searching user",
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
          reject({ type: "LDAP_RESPONSE", message: "Error in LDAP response" });
        });

        res.on("end", () => {
          client.unbind();

          if (!userDN) {
            return reject({ type: "NOT_IN_LDAP" });
          }

          resolve(userData);
        });
      });
    });
  });
}

router.post("/verificar", asyncHandler(async (req, res) => {
  const { username } = req.body;

  const validation = validateRequired(req.body, ['username']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const usuario = await ValidarLDAP(username);

    if (!usuario) {
      return sendError(res, 'NOT_FOUND', 'User not found in LDAP');
    }

    await pool.query(
      `INSERT INTO persona (id_persona, name) 
   VALUES (?, ?)
   ON DUPLICATE KEY UPDATE 
   name = VALUES(name)`,
      [usuario.employeeID, usuario.cn || usuario.displayName],
    );

    return sendSuccess(res, {
      ok: true,
      message: "User found",
      data: usuario,
    }, 200);
    
  } catch (error) {
    sendError(res, 'LDAP_ERROR', 'Failed to verify user', error);
  }
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const validation = validateRequired(req.body, ['username', 'password']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const ldapUser = await autenticarLDAP(username, password);

    if (!ldapUser) {
      return sendError(res, 'AUTHENTICATION_FAILED', 'Invalid credentials');
    }

    const userData = {
      username,
      nombre: ldapUser.displayName || ldapUser.cn,
      rol: ldapUser.rol,
      employeeID: ldapUser.employeeID,
      activo: true,
      user_active: true,
    };

    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE username = ?`,
      [username],
    );

    let userDB;
    let role = userData.rol == "admin" ? 1 : 2;
    
    if (!rows.length) {
      await pool.query(`INSERT INTO persona(id_persona, name) VALUES (?,?)`, [
        userData.employeeID,
        userData.nombre,
      ]);

      if (userData.rol) {
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
      const existingUser = rows[0];
      
      await pool.query(
        `UPDATE usuarios 
         SET id_persona = ?, rol = ?
         WHERE id = ?`,
        [userData.employeeID, role, existingUser.id],
      );

      userDB = {
        ...existingUser,
        ...userData,
      };

      if (!existingUser.activo) {
        return sendError(res, 'USER_INACTIVE', 'User account is inactive');
      }
    }

    if (userDB.rol !== "admin") {
      if (userDB.puesto_id == null || userDB.puesto_id === "") {
        return sendError(res, 'NO_POSITION', 'User has no position assigned');
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

    await registrarAuditoria({
      usuarioId: userDB.id,
      accion: "INICIO DE SESIÓN",
      modulo: "Autenticación",
      detalles: `Usuario "${userDB.nombre}" inicia sesión`,
    });

    return sendSuccess(res, {
      success: true,
      user: userDB,
      token,
    });
  } catch (error) {
    await registrarAuditoria({
      usuarioId: username,
      accion: `LOGIN FALLIDO`,
      detalles: `Error en autenticación para usuario: ${username}`,
    });

    console.error("LDAP error:", error.message);

    sendError(res, 'AUTHENTICATION_FAILED', 'Invalid credentials', error);
  }
}));

router.get("/me", authenticateToken, asyncHandler(async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.username, u.rol, u.puesto_id,
                       p.nombre as puesto_nombre,
              per.name as nombre
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       LEFT JOIN persona per ON u.id_persona = per.id_persona
       WHERE u.id = ? AND u.activo = 1`,
      [req.user.id],
    );

    if (usuarios.length === 0) {
      return sendError(res, 'NOT_FOUND', 'User not found');
    }

    if (usuarios[0].rol !== 1) {
      if (usuarios[0].puesto_id === null) {
        return sendError(res, 'NO_POSITION', 'User has no position assigned');
      }
    }

    sendSuccess(res, usuarios[0]);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch user information', error);
  }
}));

module.exports = router;
