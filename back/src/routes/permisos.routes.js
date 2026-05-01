const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/usuarios/permisos/todos
 * Obtener todos los administradores con sus permisos
 */
router.get('/permisos/todos', asyncHandler(async (req, res) => {
  try {
    const [admins] = await pool.query(`
      SELECT DISTINCT
    u.*, 
    per.name AS nombre
FROM usuarios u
LEFT JOIN persona per ON u.id_persona = per.id_persona
WHERE u.activo = TRUE and u.rol=1
ORDER BY u.rol;
    `);

    for (const admin of admins) {
      const [permisos] = await pool.query(
        `SELECT p.id, p.nombre
        FROM usuarios_permisos up
        INNER JOIN permisos p ON p.id = up.permiso_id
        WHERE up.usuario_id = ? AND up.activo = TRUE
        ORDER BY p.nombre`,
        [admin.id]
      );
      admin.permisos = permisos;
    }

    sendSuccess(res, admins);

  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch admins with permissions', error);
  }
}));

/**
 * GET /api/usuarios/:id/permisos
 * Obtener permisos de un usuario específico
 */
router.get('/:id/permisos', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid user ID');
    }

    const [rows] = await pool.query(`
      SELECT p.id
      FROM permisos p
      INNER JOIN usuarios_permisos up ON up.permiso_id = p.id
      WHERE up.usuario_id = ? AND up.activo = 1
    `, [id]);

    sendSuccess(res, rows.map(r => r.id));
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch user permissions', error);
  }
}));

/**
 * POST /api/usuarios/permisos
 * Asignar un permiso a un usuario
 */
router.post('/permisos', authenticateToken, asyncHandler(async (req, res) => {
  const { usuario_id, permiso_id } = req.body;

  const validation = validateRequired(req.body, ['usuario_id', 'permiso_id']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO usuarios_permisos (usuario_id, permiso_id, activo)
      VALUES (?, ?, 1)
    `, [usuario_id, permiso_id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuario_id}, Permiso ID: ${permiso_id}`
    });

    sendSuccess(res, {
      id: result.insertId,
      usuario_id,
      permiso_id,
      activo: 1
    }, 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 'DUPLICATE_ENTRY', 'Permission already assigned to user');
    }
    sendError(res, 'DATABASE_ERROR', 'Failed to assign permission', error);
  }
}));

/**
 * PUT /api/usuarios/:usuarioId/permisos/:permisoId
 * Actualizar el estado de un permiso de usuario
 */
router.put('/:usuarioId/permisos/:permisoId', authenticateToken, asyncHandler(async (req, res) => {
  const { usuarioId, permisoId } = req.params;
  const { activo } = req.body;

  if (!isValidId(usuarioId) || !isValidId(permisoId)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user or permission ID');
  }

  try {
    const [rows] = await pool.query(
      `SELECT 1 FROM usuarios_permisos
       WHERE usuario_id = ? AND permiso_id = ?`,
      [usuarioId, permisoId]
    );

    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO usuarios_permisos (usuario_id, permiso_id, activo)
         VALUES (?, ?, 1)`,
        [usuarioId, permisoId]
      );

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'CREAR Y ACTIVAR PERMISO',
        modulo: 'Permisos',
        detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`
      });

      return sendSuccess(res, { message: 'Permission created and activated' }, 201);
    }

    await pool.query(
      `UPDATE usuarios_permisos
       SET activo = ?
       WHERE usuario_id = ? AND permiso_id = ?`,
      [activo, usuarioId, permisoId]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: activo ? 'ACTIVAR PERMISO' : 'DESACTIVAR PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`
    });

    sendSuccess(res, { message: 'Permission updated' });

  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to manage permission', error);
  }
}));

/**
 * DELETE /api/usuarios/:usuarioId/permisos/:permisoId
 * Remover un permiso de un usuario
 */
router.delete('/:usuarioId/permisos/:permisoId', authenticateToken, asyncHandler(async (req, res) => {
  const { usuarioId, permisoId } = req.params;

  if (!isValidId(usuarioId) || !isValidId(permisoId)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid user or permission ID');
  }

  try {
    const [result] = await pool.query(`
      UPDATE usuarios_permisos
      SET activo = 0
      WHERE usuario_id = ? AND permiso_id = ?
    `, [usuarioId, permisoId]);

    if (result.affectedRows === 0) {
      return sendError(res, 'NOT_FOUND', 'Permission not found');
    }

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'REMOVER PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`
    });

    sendSuccess(res, { message: 'Permission removed from user' });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to remove permission', error);
  }
}));

module.exports = router;