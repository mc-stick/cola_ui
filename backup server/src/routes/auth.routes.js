const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Autenticar usuario y generar token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE username = ? AND activo = TRUE AND user_active = TRUE',
      [username]
    );

    if (rows.length === 0) {
      await registrarAuditoria({
        usuarioId: null,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: `Usuario: ${username}`,
        req
      });
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await registrarAuditoria({
        usuarioId: user.id,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: `Contraseña incorrecta para ${user.nombre}`,
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
      detalles: `Usuario "${user.nombre}" con privilegios "${user.rol}" inicia sesion`,
      req
    });

    res.json({ user, token, success: true });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
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