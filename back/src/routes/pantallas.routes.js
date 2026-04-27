const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/pantallas
 * Obtener todas las pantallas
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pantallas ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo pantallas:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});



/**
 * POST /api/pantallas
 * Crear una nueva pantalla
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, token } = req.body;
    console.log("nombre.tokn",nombre,token)

    const [result] = await pool.query(
      'INSERT INTO pantallas (nombre, token) VALUES (?, ?)',
      [nombre, token]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR PANTALLA',
      modulo: 'Pantallas',
      detalles: `Nombre: ${nombre}, Token: ${token}`,
      req
    });

    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Error creando pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * PUT /api/pantallas/:id
 * Actualizar una pantalla
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, token } = req.body;

    const [rows] = await pool.query('SELECT * FROM pantallas WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pantalla no encontrada' });
    const anterior = rows[0];

    await pool.query(
      'UPDATE pantallas SET nombre = ?, token = ? WHERE id = ?',
      [nombre, token, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR PANTALLA ID: ${id}`,
      modulo: 'Pantallas',
      detalles: `Cambió "${anterior.nombre} (${anterior.token})" por "${nombre} (${token})"`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * DELETE /api/pantallas/:id
 * Eliminar una pantalla
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pantallas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pantalla no encontrada' });
    const anterior = rows[0];

    await pool.query('DELETE FROM pantallas WHERE id = ?', [req.params.id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR PANTALLA',
      modulo: 'Pantallas',
      detalles: `ID: ${req.params.id}, Nombre: ${anterior.nombre}, Token: ${anterior.token}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando pantalla:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

module.exports = router;