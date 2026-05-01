const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired, isValidId } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/medios
 * Obtener todos los medios activos
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, tipo, url, nombre, activo, medio_active, tamano_kb, created_at
       FROM medios 
       WHERE activo = TRUE 
       ORDER BY id, created_at`
    );
    
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch media', error);
  }
}));

/**
 * POST /api/medios
 * Crear un nuevo medio (imagen o video)
 */
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { tipo, url, nombre, orden, es_local, tamano_kb } = req.body;
  
  const validation = validateRequired(req.body, ['tipo', 'url', 'nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  if (!['imagen', 'video'].includes(tipo)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid type. Must be: imagen or video');
  }

  const urlLength = url.length;
  const isBase64 = url.startsWith('data:');

  if (isBase64) {
    if (tipo === 'imagen' && !url.startsWith('data:image/')) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid Base64 for image');
    }
    if (tipo === 'video' && !url.startsWith('data:video/')) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid Base64 for video');
    }
  }

  try {
    const connection = await pool.getConnection();
    
    await connection.query("SET GLOBAL max_allowed_packet=1073741824");

    const [result] = await pool.query(
      `INSERT INTO medios 
       (tipo, url, nombre, tamano_kb) 
       VALUES (?, ?, ?, ?)`,
      [
        tipo, 
        url, 
        nombre, 
        tamano_kb || Math.round(urlLength / 1024)
      ]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR MEDIO',
      modulo: 'Medios',
      detalles: `Tipo: ${tipo}, Nombre: ${nombre}, ID: ${result.insertId}`
    });
    
    sendSuccess(res, { 
      id: result.insertId, 
      success: true,
      message: 'Medio guardado correctamente'
    }, 201);
    
  } catch (error) {
    if (error.code === 'ER_DATA_TOO_LONG') {
      return sendError(res, 'VALIDATION_ERROR', 'File is too large to store');
    }
    sendError(res, 'DATABASE_ERROR', 'Failed to save media', error);
  }
}));

/**
 * PUT /api/medios/:id
 * Actualizar un medio existente
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tipo, url, nombre, orden, activo, es_local, tamano_kb } = req.body;
  
  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid media ID');
  }

  const validation = validateRequired(req.body, ['tipo', 'url', 'nombre']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    await pool.query(
      `UPDATE medios 
       SET tipo = ?, url = ?, nombre = ?, activo = ?, tamano_kb = ?
       WHERE id = ?`,
      [tipo, url, nombre, activo, tamano_kb, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}, Nombre: ${nombre}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update media', error);
  }
}));

/**
 * DELETE /api/medios/:id
 * Desactivar un medio (soft delete)
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid media ID');
  }

  try {
    await pool.query(
      'UPDATE medios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to delete media', error);
  }
}));

/**
 * DELETE /api/medios/:id/switch
 * Alternar el estado activo/inactivo de un medio en pantalla
 */
router.delete('/:id/switch', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, 'VALIDATION_ERROR', 'Invalid media ID');
  }

  try {
    const [rows] = await pool.query(
      'SELECT medio_active, tipo, nombre FROM medios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'NOT_FOUND', 'Media not found');
    }

    const nuevoValor = !rows[0].medio_active;
    const tipo = rows[0].tipo;
    const nombre = rows[0].nombre;

    await pool.query(
      'UPDATE medios SET medio_active = ? WHERE id = ?',
      [nuevoValor, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? `ACTIVAR MEDIO` : `DESACTIVAR MEDIO`,
      modulo: 'Medios',
      detalles: nuevoValor ? `Activó ${tipo} ${nombre} en pantalla` : `Desactivó ${tipo} ${nombre} en pantalla`
    });

    sendSuccess(res, { success: true, medio_active: nuevoValor });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update media status', error);
  }
}));

module.exports = router;