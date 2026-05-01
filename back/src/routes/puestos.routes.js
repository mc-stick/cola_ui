const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/puestos
 * Obtener todos los puestos activos
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM puestos WHERE activo = TRUE ORDER BY id'
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch positions', error);
  }
}));

/**
 * POST /api/puestos
 * Crear un nuevo puesto
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { numero, nombre } = req.body;

  const validation = validateRequired(req.body, ['nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  const nombreStr = nombre != null ? nombre.toString().trim() : '';

  if (!nombreStr) {
    return sendError(res, 'VALIDATION_ERROR', 'Position name cannot be empty');
  }

  try {
    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE nombre = ?',
      [nombreStr]
    );

    if (existentes.length > 0) {
      return sendError(res, 'DUPLICATE_ENTRY', 'A position with this name already exists');
    }

    const [result] = await pool.query(
      'INSERT INTO puestos (nombre) VALUES (?)',
      [nombreStr]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR PUESTO',
      modulo: 'Puestos',
      detalles: `Nombre: ${nombreStr}, ID: ${result.insertId}`
    });

    sendSuccess(res, { id: result.insertId, success: true }, 201);
    
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to create position', error);
  }
}));

/**
 * PUT /api/puestos/:id
 * Actualizar un puesto existente
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { numero, nombre, activo } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid position ID');
  }

  const validation = validateRequired(req.body, ['nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE (nombre = ?) AND id != ?',
      [nombre, id]
    );

    if (existentes.length > 0) {
      return sendError(res, 'DUPLICATE_ENTRY', 'Another position with this name already exists');
    }

    await pool.query(
      'UPDATE puestos SET nombre = ?, activo = ? WHERE id = ?',
      [nombre, activo, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${id}, Nombre: ${nombre}`
    });

    sendSuccess(res, { success: true });

  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update position', error);
  }
}));

/**
 * DELETE /api/puestos/:id/switch
 * Alternar el estado activo/inactivo de un puesto
 */
router.delete('/:id/switch', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid position ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT puesto_active, nombre FROM puestos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Position not found');
    }

    const [usuariosAsignados] = await pool.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE puesto_id = ?',
      [id]
    );

    if (usuariosAsignados[0].total > 0) {
      return sendError(res, 'CONFLICT', 'Cannot deactivate position - it has assigned users');
    }

    const nuevoValor = !rows[0].puesto_active;
    const name = rows[0].nombre;

    await pool.query(
      'UPDATE puestos SET puesto_active = ? WHERE id = ?',
      [nuevoValor, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 'ACTIVAR PUESTO' : 'DESACTIVAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${id}, Nombre: ${name}`
    });

    sendSuccess(res, { success: true, puesto_active: nuevoValor });

  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update position status', error);
  }
}));

module.exports = router;