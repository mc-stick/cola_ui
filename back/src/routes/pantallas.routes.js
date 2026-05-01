const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/pantallas
 * Obtener todas las pantallas
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pantallas ORDER BY nombre');
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch screens', error);
  }
}));



/**
 * POST /api/pantallas
 * Crear una nueva pantalla
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { nombre, token } = req.body;

  const validation = validateRequired(req.body, ['nombre', 'token']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO pantallas (nombre, token) VALUES (?, ?)',
      [nombre, token]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR PANTALLA',
      modulo: 'Pantallas',
      detalles: `Nombre: ${nombre}, Token: ${token}`
    });

    sendSuccess(res, { id: result.insertId, success: true }, 201);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to create screen', error);
  }
}));

/**
 * PUT /api/pantallas/:id
 * Actualizar una pantalla
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, token } = req.body;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid screen ID');
  }

  const validation = validateRequired(req.body, ['nombre', 'token']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    const [rows] = await pool.query('SELECT * FROM pantallas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Screen not found');
    }
    const anterior = rows[0];

    await pool.query(
      'UPDATE pantallas SET nombre = ?, token = ? WHERE id = ?',
      [nombre, token, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR PANTALLA ID: ${id}`,
      modulo: 'Pantallas',
      detalles: `Cambió "${anterior.nombre} (${anterior.token})" por "${nombre} (${token})"`
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update screen', error);
  }
}));

/**
 * DELETE /api/pantallas/:id
 * Eliminar una pantalla
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid screen ID');
  }

  try {
    const [rows] = await pool.query('SELECT * FROM pantallas WHERE id = ?', [id]);
    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Screen not found');
    }
    const anterior = rows[0];

    await pool.query('DELETE FROM pantallas WHERE id = ?', [id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR PANTALLA',
      modulo: 'Pantallas',
      detalles: `ID: ${id}, Nombre: ${anterior.nombre}, Token: ${anterior.token}`
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to delete screen', error);
  }
}));

module.exports = router;