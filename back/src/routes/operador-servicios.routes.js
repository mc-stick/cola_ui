const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/operadores/:usuario_id/servicios
 * Obtener servicios asignados a un operador
 */
router.get('/operadores/:usuario_id/servicios', asyncHandler(async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    if (!isValidId(usuario_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid operator ID');
    }
    
    const [rows] = await pool.query(
      `SELECT s.*, 
              IF(os.id IS NOT NULL, TRUE, FALSE) as asignado,
              os.id as asignacion_id
       FROM servicios s
       LEFT JOIN operador_servicios os 
         ON s.id = os.servicio_id 
         AND os.usuario_id = ? 
         AND os.activo = TRUE
       WHERE s.activo = TRUE
       ORDER BY s.nombre`,
      [usuario_id]
    );
    
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch operator services', error);
  }
}));

/**
 * POST /api/operadores/:usuario_id/servicios/:servicio_id
 * Asignar un servicio a un operador
 */
router.post('/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    if (!isValidId(usuario_id) || !isValidId(servicio_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid operator or service ID');
    }
    
    await pool.query(
      `INSERT INTO operador_servicios (usuario_id, servicio_id) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE activo = TRUE`,
      [usuario_id, servicio_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR SERVICIO A OPERADOR',
      modulo: 'Operadores-Servicios',
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to assign service to operator', error);
  }
}));

/**
 * DELETE /api/operadores/:usuario_id/servicios/:servicio_id
 * Desasignar un servicio de un operador
 */
router.delete('/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    if (!isValidId(usuario_id) || !isValidId(servicio_id)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid operator or service ID');
    }
    
    await pool.query(
      'DELETE FROM operador_servicios WHERE usuario_id = ? AND servicio_id = ?',
      [usuario_id, servicio_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'DESASIGNAR SERVICIO DE OPERADOR',
      modulo: 'Operadores-Servicios',
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to unassign service from operator', error);
  }
}));

/**
 * GET /api/operadores-servicios
 * Obtener todos los operadores con sus servicios asignados
 */
router.get('/operadores-servicios', asyncHandler(async (req, res) => {
  try {    
    const [operadores] = await pool.query(
      `SELECT DISTINCT
    u.*, 
    per.name AS nombre,
    p.nombre AS puesto_nombre
FROM usuarios u
LEFT JOIN puestos p ON u.puesto_id = p.id
LEFT JOIN persona per ON u.id_persona = per.id_persona
WHERE u.activo = TRUE and u.rol=2
ORDER BY u.rol;`
    );
    
    for (let operador of operadores) {
      const [servicios] = await pool.query(
        `SELECT s.id, s.nombre, s.codigo, s.color
         FROM operador_servicios os
         JOIN servicios s ON os.servicio_id = s.id
         WHERE os.usuario_id = ? AND os.activo = TRUE AND s.activo = TRUE
         ORDER BY s.nombre`,
        [operador.id]
      );
      operador.servicios = servicios;
    }
    
    sendSuccess(res, operadores);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch operators with services', error);
  }
}));

module.exports = router;