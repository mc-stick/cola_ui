const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/pantallas-servicios/:pantalla_id/servicios
 * Obtener todos los servicios indicando cuáles están asignados a la pantalla
 */
router.get('/:pantalla_id/servicios', async (req, res) => {
  try {
    const { pantalla_id } = req.params;

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

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo servicios de pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/pantallas-servicios/token/:token/tickets
 * Obtener tickets llamados filtrados por token de pantalla
 */
router.get('/token/:token/tickets', async (req, res) => {
  try {
    const { token } = req.params;

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

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets por pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * POST /api/pantallas-servicios/:pantalla_id/servicios/:servicio_id
 * Asignar un servicio a una pantalla
 */
router.post('/:pantalla_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { pantalla_id, servicio_id } = req.params;

    await pool.query(
      `INSERT INTO servicio_pantallas (pantalla_id, servicio_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE pantalla_id = pantalla_id`, // no-op si ya existe
      [pantalla_id, servicio_id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR SERVICIO A PANTALLA',
      modulo: 'Pantallas-Servicios',
      detalles: `Pantalla ID: ${pantalla_id}, Servicio ID: ${servicio_id}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error asignando servicio a pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * DELETE /api/pantallas-servicios/:pantalla_id/servicios/:servicio_id
 * Desasignar un servicio de una pantalla
 */
router.delete('/:pantalla_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { pantalla_id, servicio_id } = req.params;

    await pool.query(
      'DELETE FROM servicio_pantallas WHERE pantalla_id = ? AND servicio_id = ?',
      [pantalla_id, servicio_id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'DESASIGNAR SERVICIO DE PANTALLA',
      modulo: 'Pantallas-Servicios',
      detalles: `Pantalla ID: ${pantalla_id}, Servicio ID: ${servicio_id}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error desasignando servicio de pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/pantallas-servicios
 * Obtener todas las pantallas con sus servicios asignados
 */
router.get('/', async (req, res) => {
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

    res.json(pantallas);
  } catch (error) {
    console.error('Error obteniendo pantallas con servicios:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

module.exports = router;