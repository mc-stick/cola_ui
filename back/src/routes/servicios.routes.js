const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/servicios
 * Obtener todos los servicios activos
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch services', error);
  }
}));

/**
 * POST /api/servicios
 * Crear un nuevo servicio
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { nombre, descripcion, codigo, color, departamento_id, check } = req.body;

  const validation = validateRequired(req.body, ['nombre', 'codigo']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, codigo, color, departamento, dar_prioridad) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, codigo, color, departamento_id, check ? 1 : 0]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 1,
      modulo: 'Servicios',
      detalles: `Servicio creado: ${nombre} (Código: ${codigo})`,
    });

    sendSuccess(res, { id: result.insertId, success: true }, 201);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to create service', error);
  }
}));

/**
 * PUT /api/servicios/:id
 * Actualizar un servicio existente
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, color, departamento_id, activo, check } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid service ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT nombre FROM servicios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Service not found');
    }

    const anterior = rows[0].nombre;

    await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, color = ?, departamento = ?, activo = ?, dar_prioridad = ? WHERE id = ?',
      [nombre, descripcion, color, departamento_id, activo, check ? 1 : 0, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 2,
      modulo: 'Servicios',
      detalles: `Servicio actualizado: "${anterior}" → "${nombre}"`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update service', error);
  }
}));

/**
 * DELETE /api/servicios/:id
 * Desactivar un servicio (soft delete)
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid service ID');
  }

  try {
    await pool.query('UPDATE servicios SET activo = FALSE WHERE id = ?', [id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 5,
      modulo: 'Servicios',
      detalles: `Servicio desactivado: ID ${id}`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to deactivate service', error);
  }
}));

/**
 * DELETE /api/servicios/:id/switch
 * Alternar el estado activo/inactivo de un servicio
 */
router.delete('/:id/switch', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid service ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT service_active FROM servicios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Service not found');
    }

    const nuevoValor = !rows[0].service_active;

    await pool.query(
      'UPDATE servicios SET service_active = ? WHERE id = ?',
      [nuevoValor, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 4 : 5,
      modulo: 'Servicios',
      detalles: `Servicio ${nuevoValor ? 'activado' : 'desactivado'}: ID ${id}`,
    });

    sendSuccess(res, { success: true, service_active: nuevoValor });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to toggle service status', error);
  }
}));

module.exports = router;