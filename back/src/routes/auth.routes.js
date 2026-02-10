// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { pool } = require('../config/database');
// const { registrarAuditoria } = require('../utils/auditoria');
// const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// const router = express.Router();

// /**
//  * POST /api/auth/login
//  * Autenticar usuario y generar token JWT
//  */
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const [rows] = await pool.query(
//       'SELECT * FROM usuarios WHERE username = ? AND activo = TRUE AND user_active = TRUE',
//       [username]
//     );

//     if (rows.length === 0) {
//       await registrarAuditoria({
//         usuarioId: null,
//         accion: 'LOGIN FALLIDO',
//         modulo: 'Autenticación',
//         detalles: `Usuario: ${username}`,
//         req
//       });
//       return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
//     }

//     const user = rows[0];

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       await registrarAuditoria({
//         usuarioId: user.id,
//         accion: 'LOGIN FALLIDO',
//         modulo: 'Autenticación',
//         detalles: `Contraseña incorrecta para ${user.nombre}`,
//         req
//       });
//       return res.status(401).json({ error: 'Credenciales inválidas' });
//     }

//     delete user.password;

//     const token = jwt.sign(
//       { id: user.id, nombre: user.nombre, rol: user.rol },
//       JWT_SECRET,
//       { expiresIn: '8h' }
//     );

//     await registrarAuditoria({
//       usuarioId: user.id,
//       accion: 'LOGIN EXITOSO',
//       modulo: 'Autenticación',
//       detalles: `Usuario "${user.nombre}" con privilegios "${user.rol}" inicia sesion`,
//       req
//     });

//     res.json({ user, token, success: true });

//   } catch (error) {
//     console.error('Error en login:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// /**
//  * GET /api/auth/me
//  * Obtener información del usuario autenticado
//  */
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const [usuarios] = await pool.query(
//       `SELECT u.id, u.nombre, u.username, u.rol, u.puesto_id, u.tel,
//               p.nombre as puesto_nombre, p.numero as puesto_numero 
//        FROM usuarios u
//        LEFT JOIN puestos p ON u.puesto_id = p.id
//        WHERE u.id = ?`,
//       [req.user.id]
//     );

//     if (usuarios.length === 0) {
//       return res.status(404).json({ error: 'Usuario no encontrado' });
//     }

//     res.json(usuarios[0]);
//   } catch (error) {
//     console.error('Error obteniendo usuario:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

require('dotenv').config();

const router = express.Router();

const ldapUrl = process.env.LDAP_URL; 
const baseDN = process.env.LDAP_DN; 


// function autenticarLDAP(username, password) {
//   return new Promise((resolve, reject) => {
//     const client = ldap.createClient({ url: ldapUrl });

//     const serviceUser = process.env.LDAP_BIND_USER;
//     const servicePass = process.env.LDAP_BIND_PASSWORD;

//     client.bind(serviceUser, servicePass, (err) => {
//       if (err) {
//         client.unbind();
//         return reject({ type: 'LDAP_CONN', message: 'Error conectando a LDAP' });
//       }

//       const opts = {
//         filter: `(sAMAccountName=${username})`,
//         scope: 'sub',
//         attributes: [
//           'dn',
//           'cn',
//           'displayName',
//           'mail',
//           'sAMAccountName',
//           'memberOf'
//         ]
//       };

//       client.search(baseDN, opts, (err, res) => {
//         if (err) {
//           client.unbind();
//           return reject({ type: 'LDAP_SEARCH', message: 'Error buscando usuario LDAP' });
//         }

//         let userDN = null;
//         let userData = [];

//         res.on('searchEntry', (entry) => {
//           userDN = entry.pojo.objectName;
//           entry.pojo.attributes.forEach(attr => {

//   if (attr.type === 'memberOf') {
//     const grupos = attr.values.map(g => {
//       const match = g.match(/CN=([^,]+)/);
//       return match ? match[1].toLowerCase() : g.toLowerCase();
//     });

//     userData.memberOf = grupos;

//     if (grupos.includes('admin-cola')) {
//       userData.rol = 'admin';
//     } else if (grupos.includes('operador-cola')) {
//       userData.rol = 'operador';
//     } else {
//       userData.rol = 'usuario-ldap';
//     }

//     return;
//   }

//   userData[attr.type] =
//     attr.values.length === 1 ? attr.values[0] : attr.values;
// });

// console.log(userData,"user data ldap")
//         });
       


//         res.on('error', () => {
//           client.unbind();
//           reject({ type: 'LDAP_RESPONSE', message: 'Error respuesta LDAP' });
//         });

//         res.on('end', () => {
//           if (!userDN) {
//             client.unbind();
//             return reject({ type: 'NOT_IN_LDAP' });
//           }

//           client.bind(userDN, password, (err) => {
//             client.unbind();

//             if (err) {
//               return reject({ type: 'BAD_PASSWORD' });
//             }
            
//             resolve(userData);
//           });
//         });
//       });
//     });
//   });
// }

router.post('/login', async (req, res) => {
  const { username, password } = req.body;


  // try {
  //   const ldapUser = '';
  //   //const ldapUser = await autenticarLDAP(username, password); //LDAP DESCOMENTAR PARA ACTIVAR

  //   const user = {
  //     id: "1",
  //     nombre: ldapUser.displayName || ldapUser.cn,
  //     rol: ldapUser.rol,
  //     mail: ldapUser.mail
  //   };

  //   console.log(ldapUser,"dap user")
    
  //   const token = jwt.sign(
  //     { id: user.id, nombre: user.nombre, rol: user.rol },
  //     JWT_SECRET,
  //     { expiresIn: '8h' }
  //   );

  //   await registrarAuditoria({
  //     usuarioId: user.nombre,
  //     accion: 'LOGIN EXITOSO',
  //     modulo: 'Autenticación',
  //     detalles: `Usuario LDAP "${user.nombre}" inicia sesión`,
  //     req
  //   });

  //   return res.json({ user, token, success: true });

  // } catch (ldapError) {

    
  //   if (ldapError.type === 'BAD_PASSWORD') {
  //     await registrarAuditoria({
  //       usuarioId: username,
  //       accion: 'LOGIN FALLIDO',
  //       modulo: 'Autenticación',
  //       detalles: 'Contraseña incorrecta (LDAP)',
  //       req
  //     });

  //     return res.status(401).json({ error: 'Credenciales inválidas' });
  //   }

   
  //   if (ldapError.type !== 'NOT_IN_LDAP') {
  //     console.error('LDAP error:', ldapError.message);
  //   }
  // }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios 
       WHERE username = ? AND activo = TRUE AND user_active = TRUE`,
      [username]
    );

    if (!rows.length) {
      console.log("username: ", username)
      await registrarAuditoria({
        usuarioId: username,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: 'Usuario no encontrado',
        req
      });

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await registrarAuditoria({
        usuarioId: user.id,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: 'Contraseña incorrecta (DB)',
        req
      });

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    delete user.password;

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await registrarAuditoria({
      usuarioId: user.id,
      accion: 'LOGIN EXITOSO',
      modulo: 'Autenticación',
      detalles: `Usuario "${user.nombre}" inicia sesión`,
      req
    });

    return res.json({ user, token, success: true });

  } catch (dbError) {
    console.error('DB error:', dbError);
    return res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.nombre, u.username, u.rol, u.puesto_id, u.tel,
              p.nombre as puesto_nombre, p.numero as puesto_numero 
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
