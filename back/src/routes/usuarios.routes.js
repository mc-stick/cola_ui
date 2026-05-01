const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId, isValidLength } = require('../utils/validator');

const router = express.Router();

const SALT_ROUNDS = 10;

/**
 * GET /api/usuarios
 * Obtener todos los usuarios
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        u.id,
        u.username,
        u.rol,
        u.activo,
        u.tel,
        u.puesto_id,
        per.name AS nombre,
        p.nombre AS puesto_nombre
      FROM usuarios u
      LEFT JOIN puestos p ON u.puesto_id = p.id
      LEFT JOIN persona per ON u.id_persona = per.id_persona
      ORDER BY u.rol`
    );

    // Remove passwords
    rows.forEach(user => delete user.password);
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch users', error);
  }
}));

/**
 * GET /api/usuarios/:user
 * Obtener información de un usuario por username
 */
router.get('/:user', asyncHandler(async (req, res) => {
  const { user } = req.params;

  if (!user) {
    return sendError(res, 'VALIDATION_ERROR', 'Username is required');
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, tel, rol FROM usuarios WHERE activo = TRUE AND username = ?',
      [user]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'User not found');
    }

    sendSuccess(res, rows[0]);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch user', error);
  }
}));

/**
 * POST /api/usuarios
 * Crear un nuevo usuario
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { username, password, rol, puesto_id, tel } = req.body;

  const validation = validateRequired(req.body, ['username', 'password', 'rol']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  if (!isValidLength(password, 6, 100)) {
    return sendError(res, 'VALIDATION_ERROR', 'Password must be between 6 and 100 characters');
  }

  if (!isValidLength(username, 3, 50)) {
    return sendError(res, 'VALIDATION_ERROR', 'Username must be between 3 and 50 characters');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO usuarios (username, password, rol, puesto_id, tel, activo) VALUES (?, ?, ?, ?, ?, 1)',
      [username, hashedPassword, rol, puesto_id || null, tel || null]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 1,
      modulo: 'Usuarios',
      detalles: `Usuario creado: ${username} (Rol: ${rol})`,
    });

    sendSuccess(res, { id: result.insertId, success: true }, 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 'CONFLICT', 'Username already exists');
    }
    sendError(res, 'DATABASE_ERROR', 'Failed to create user', error);
  }
}));

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, rol, puesto_id, activo } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, rol, activo, username FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'User not found');
    }

    const usuario = rows[0];

    // Prevent disabling last active admin
    if (usuario.rol === 1 && usuario.activo && !activo) {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = 1 AND activo = 1'
      );

      if (admins[0].total <= 1) {
        return sendError(res, 'CONFLICT', 'Cannot disable the last active administrator');
      }
    }

    await pool.query(
      'UPDATE usuarios SET username = ?, rol = ?, puesto_id = ?, activo = ? WHERE id = ?',
      [username, rol, rol === 2 ? puesto_id : null, activo, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 2,
      modulo: 'Usuarios',
      detalles: `Usuario actualizado: ${username} (Rol: ${rol})`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update user', error);
  }
}));

/**
 * PUT /api/usuarios/:id/change
 * Cambiar contraseña de un usuario
 */
router.put('/:id/change', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
  }

  if (!password) {
    return sendError(res, 'VALIDATION_ERROR', 'Password is required');
  }

  if (!isValidLength(password, 6, 100)) {
    return sendError(res, 'VALIDATION_ERROR', 'Password must be between 6 and 100 characters');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 3,
      modulo: 'Usuarios',
      detalles: `Contraseña cambiada para usuario ID: ${id}`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to change password', error);
  }
}));

/**
 * PUT /api/usuarios/:id/operator
 * Actualizar datos específicos de operador
 */
router.put('/:id/operator', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pass, tel } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
  }

  const updates = [];
  const params = [];

  if (pass) {
    if (!isValidLength(pass, 6, 100)) {
      return sendError(res, 'VALIDATION_ERROR', 'Password must be between 6 and 100 characters');
    }
    const hashedPassword = bcrypt.hashSync(pass, SALT_ROUNDS);
    updates.push('password = ?');
    params.push(hashedPassword);
  }

  if (tel) {
    updates.push('tel = ?');
    params.push(tel);
  }

  if (updates.length === 0) {
    return sendError(res, 'VALIDATION_ERROR', 'No fields to update');
  }

  try {
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 2,
      modulo: 'Usuarios',
      detalles: `Datos de operador actualizados: ID ${id}`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update operator', error);
  }
}));

/**
 * DELETE /api/usuarios/:id
 * Desactivar un usuario
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, rol, activo, username FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'User not found');
    }

    const usuario = rows[0];

    // Prevent deactivating last active admin
    if (usuario.rol === 1 && usuario.activo) {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = 1 AND activo = 1'
      );

      if (admins[0].total <= 1) {
        return sendError(res, 'CONFLICT', 'Cannot deactivate the last active administrator');
      }
    }

    await pool.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 5,
      modulo: 'Usuarios',
      detalles: `Usuario desactivado: ${usuario.username}`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to deactivate user', error);
  }
}));

/**
 * DELETE /api/usuarios/:id/switch
 * Alternar el estado activo/inactivo de un usuario
 */
router.delete('/:id/switch', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, rol, activo, username FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'User not found');
    }

    const usuario = rows[0];
    const nuevoValor = !usuario.activo;

    // Prevent deactivating last active admin
    if (usuario.rol === 1 && usuario.activo && !nuevoValor) {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = 1 AND activo = 1'
      );

      if (admins[0].total <= 1) {
        return sendError(res, 'CONFLICT', 'Cannot disable the last active administrator');
      }
    }

    await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoValor, id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 4 : 5,
      modulo: 'Usuarios',
      detalles: `Usuario ${nuevoValor ? 'activado' : 'desactivado'}: ${usuario.username}`,
    });

    sendSuccess(res, { success: true, activo: nuevoValor });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to toggle user status', error);
  }
}));

module.exports = router;