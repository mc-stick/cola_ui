const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/configuracion
 * Obtener configuración del sistema
 */
router.get('/', asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion LIMIT 1');
    sendSuccess(res, rows[0] || {});
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch configuration', error);
  }
}));

/**
 * PUT /api/configuracion/:id
 * Actualizar configuración del sistema
 */
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion, Split, blur } = req.body;

  const validation = validateRequired(req.body, ['nombre_empresa']);
  if (!validation.valid) {
    return sendError(res, 'VALIDATION_ERROR', `Missing fields: ${validation.missingFields.join(', ')}`);
  }

  try {
    await pool.query(
      'UPDATE configuracion SET nombre_empresa = ?, logo_url = ?, mostrar_imagenes = ?, mostrar_videos = ?, tiempo_rotacion = ?, Split=?, blur=? WHERE id = ?',
      [nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion*1000, Split, blur, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR CONFIGURACIÓN',
      detalles: `${nombre_empresa}, Mostrar imagenes: ${mostrar_imagenes?"Si":"No"}, Mostrar Videos: ${mostrar_videos?"Si":"No"}, Dividir pantalla: ${Split?"Si":"No"}, Pantalla dinámica: ${blur?"Si":"No"}`
    });
    
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to update configuration', error);
  }
}));

module.exports = router;