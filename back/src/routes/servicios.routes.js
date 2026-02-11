const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/servicios
 * Obtener todos los servicios activos
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/servicios
 * Crear un nuevo servicio
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, color, tiempo_promedio } = req.body;
   
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, codigo, color, tiempo_promedio) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, codigo, color, tiempo_promedio]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR SERVICIO',
      modulo: 'Servicios',
      detalles: `Nombre: ${nombre}, Código: ${codigo}, ID: ${result.insertId}`,
      req
    });
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/servicios/:id
 * Actualizar un servicio existente
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color, tiempo_promedio, activo } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE id = ?',
      [id]
    );
    const anterior = rows[0].nombre;
    
    await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, color = ?, tiempo_promedio = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, color, tiempo_promedio, activo, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR SERVICIO ID: ${id}`,
      modulo: 'Servicios',
      detalles: ` Cambió "${anterior}" por "${nombre}"`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/servicios/:id
 * Desactivar un servicio (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = FALSE WHERE id = ?', [req.params.id]);
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR SERVICIO',
      modulo: 'Servicios',
      detalles: `ID: ${req.params.id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/servicios/:id/switch
 * Alternar el estado activo/inactivo de un servicio
 */
router.delete('/:id/switch', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT service_active FROM servicios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const nuevoValor = !rows[0].service_active;

    await pool.query(
      'UPDATE servicios SET service_active = ? WHERE id = ?',
      [nuevoValor, req.params.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 'ACTIVAR SERVICIO' : 'DESACTIVAR SERVICIO',
      modulo: 'Servicios',
      detalles: `ID: ${req.params.id}`,
      req
    });

    res.json({ success: true, service_active: nuevoValor });
  } catch (error) {
    console.error('Error modificando servicio:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

module.exports = router;