const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/configuracion
 * Obtener configuración del sistema
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/configuracion/:id
 * Actualizar configuración del sistema
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion, Split,blur } = req.body;
    console.log('Split:', req.body)
    await pool.query(
      'UPDATE configuracion SET nombre_empresa = ?, logo_url = ?, mostrar_imagenes = ?, mostrar_videos = ?, tiempo_rotacion = ?, Split=?, blur=? WHERE id = ?',
      [nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion*1000, Split, blur, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR CONFIGURACIÓN',
      detalles: `${nombre_empresa}, Mostrar imagenes: ${mostrar_imagenes?"Si":"No"}, Mostrar Videos: ${mostrar_videos?"Si":"No"}, Dividir pantalla: ${Split?"Si":"No"}, Pantalla dinámica: ${blur?"Si":"No"}`
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

module.exports = router;