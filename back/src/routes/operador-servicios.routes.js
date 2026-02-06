const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/operadores/:usuario_id/servicios
 * Obtener servicios asignados a un operador
 */
router.get('/operadores/:usuario_id/servicios', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
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
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo servicios del operador:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/operadores/:usuario_id/servicios/:servicio_id
 * Asignar un servicio a un operador
 */
router.post('/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
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
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error asignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/operadores/:usuario_id/servicios/:servicio_id
 * Desasignar un servicio de un operador
 */
router.delete('/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    await pool.query(
      'DELETE FROM operador_servicios WHERE usuario_id = ? AND servicio_id = ?',
      [usuario_id, servicio_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'DESASIGNAR SERVICIO DE OPERADOR',
      modulo: 'Operadores-Servicios',
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error desasignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/operadores-servicios
 * Obtener todos los operadores con sus servicios asignados
 */
router.get('/operadores-servicios', async (req, res) => {
  try {    
    const [operadores] = await pool.query(
      `SELECT DISTINCT
        u.id, u.nombre, u.username, u.puesto_id, u.user_active,
        p.numero as puesto_numero, p.nombre as puesto_nombre
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       WHERE u.rol = 'operador' AND u.activo = TRUE
       ORDER BY u.nombre`
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
    
    res.json(operadores);
  } catch (error) {
    console.error('Error obteniendo operadores con servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;