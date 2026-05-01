const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/departamento
 * Obtener todos los departamento activos
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM departamento'
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch departments', error);
  }
}));

/**
 * POST /api/departamento
 * Crear un nuevo departamento
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { nombre } = req.body;

  const validation = validateRequired(req.body, ['nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO departamento (nombre) VALUES (?)',
      [nombre]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR DEPARTAMENTO',
      modulo: 'Departamento',
      detalles: `Nombre: ${nombre}`
    });
    
    sendSuccess(res, { id: result.insertId, success: true }, 201);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to create department', error);
  }
}));

/**
 * PUT /api/departamento/:id
 * Actualizar un departamento existente
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid department ID');
  }

  const validation = validateRequired(req.body, ['nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM departamento WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Department not found');
    }

    const anterior = rows[0].nombre;
    
    await pool.query(
      'UPDATE departamento SET nombre = ? WHERE id = ?',
      [nombre, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR DEPARTAMENTO ID: ${id}`,
      modulo: 'departamento',
      detalles: `Cambió "${anterior}" por "${nombre}"`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update department', error);
  }
}));

/**
 * DELETE /api/departamento/:id
 * Eliminar un departamento
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid department ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM departamento WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Department not found');
    }

    const anterior = rows[0].nombre;
    await pool.query('DELETE FROM departamento WHERE id = ?', [id]);
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR DEPARTAMENTO',
      modulo: 'departamento',
      detalles: `ID: ${id}, Nombre: ${anterior}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to delete department', error);
  }
}));

module.exports = router;