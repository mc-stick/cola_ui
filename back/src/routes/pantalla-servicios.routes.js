const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/pantallas-servicios/:pantalla_id/servicios
 * Obtener todos los servicios indicando cuáles están asignados a la pantalla
 */
router.get('/:pantalla_id/servicios', asyncHandler(async (req, res) => {
  try {
    const { pantalla_id } = req.params;

    if (!isValidId(pantalla_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid screen ID');
    }

    const [rows] = await pool.query(
      `SELECT s.*,
              IF(sp.pantalla_id IS NOT NULL, TRUE, FALSE) AS asignado
       FROM servicios s
       LEFT JOIN servicio_pantallas sp
         ON s.id = sp.servicio_id
         AND sp.pantalla_id = ?
       WHERE s.activo = TRUE
       ORDER BY s.nombre`,
      [pantalla_id]
    );

    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch screen services', error);
  }
}));

/**
 * GET /api/pantallas-servicios/token/:token/tickets
 * Obtener tickets llamados filtrados por token de pantalla
 */
router.get('/token/:token/tickets', asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.trim() === '') {
      return sendError(res, 'VALIDATION_ERROR', 'Token is required');
    }

    const [rows] = await pool.query(
      `SELECT t.*
       FROM tickets t
       JOIN servicios s        ON t.servicio_id = s.id
       JOIN servicio_pantallas sp ON sp.servicio_id = s.id
       JOIN pantallas p        ON p.id = sp.pantalla_id
       WHERE p.token = ?
         AND t.status = 'llamado'
       ORDER BY t.llamado DESC`,
      [token]
    );

    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch tickets by screen', error);
  }
}));

/**
 * POST /api/pantallas-servicios/:pantalla_id/servicios/:servicio_id
 * Asignar un servicio a una pantalla
 */
router.post('/:pantalla_id/servicios/:servicio_id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { pantalla_id, servicio_id } = req.params;

    if (!isValidId(pantalla_id) || !isValidId(servicio_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid screen or service ID');
    }

    await pool.query(
      `INSERT INTO servicio_pantallas (pantalla_id, servicio_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE pantalla_id = pantalla_id`,
      [pantalla_id, servicio_id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR SERVICIO A PANTALLA',
      modulo: 'Pantallas-Servicios',
      detalles: `Pantalla ID: ${pantalla_id}, Servicio ID: ${servicio_id}`
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to assign service to screen', error);
  }
}));

/**
 * DELETE /api/pantallas-servicios/:pantalla_id/servicios/:servicio_id
 * Desasignar un servicio de una pantalla
 */
router.delete('/:pantalla_id/servicios/:servicio_id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { pantalla_id, servicio_id } = req.params;

    if (!isValidId(pantalla_id) || !isValidId(servicio_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid screen or service ID');
    }

    await pool.query(
      'DELETE FROM servicio_pantallas WHERE pantalla_id = ? AND servicio_id = ?',
      [pantalla_id, servicio_id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'DESASIGNAR SERVICIO DE PANTALLA',
      modulo: 'Pantallas-Servicios',
      detalles: `Pantalla ID: ${pantalla_id}, Servicio ID: ${servicio_id}`
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to unassign service from screen', error);
  }
}));

/**
 * GET /api/pantallas-servicios
 * Obtener todas las pantallas con sus servicios asignados
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [pantallas] = await pool.query('SELECT * FROM pantallas ORDER BY nombre');

    for (let pantalla of pantallas) {
      const [servicios] = await pool.query(
        `SELECT s.id, s.nombre, s.codigo, s.color
         FROM servicio_pantallas sp
         JOIN servicios s ON sp.servicio_id = s.id
         WHERE sp.pantalla_id = ? AND s.activo = TRUE
         ORDER BY s.nombre`,
        [pantalla.id]
      );
      pantalla.servicios = servicios;
    }

    sendSuccess(res, pantallas);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch screens with services', error);
  }
}));

module.exports = router;