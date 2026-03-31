const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/puestos
 * Obtener todos los puestos activos
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM puestos WHERE activo = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo puestos:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/puestos
 * Crear un nuevo puesto
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { numero, nombre } = req.body;

    const nombreStr = nombre != null ? nombre.toString().trim() : '';

    if (!nombreStr) {
      return res.status(400).json({
        error: 'nombre no puede estar vacío'
      });
    }

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE nombre = ?',
      [nombreStr]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un puesto con el mismo nombre'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO puestos ( nombre) VALUES (?)',
      [nombreStr]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 4,
      modulo: 'Puestos',
      detalles: `Nombre: ${nombreStr}, ID: ${result.insertId}`,
      req
    });

    res.json({ id: result.insertId, success: true });
    

  } catch (error) {
    console.error('Error creando puesto:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/puestos/:id
 * Actualizar un puesto existente
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, nombre, activo } = req.body;

    console.log(numero, nombre, activo, "puestos -----------------")

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE (nombre = ?) AND id != ?',
      [nombre, id]
    );

    console.log(existentes,"existente")

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe otro puesto con el mismo nombre'
      });
    }

    await pool.query(
      'UPDATE puestos SET nombre = ?, activo = ? WHERE id = ?',
      [nombre, activo, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 3,
      modulo: 'Puestos',
      detalles: `ID: ${id}, Nombre: ${nombre}`,
      req
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error actualizando puesto:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/puestos/:id/switch
 * Alternar el estado activo/inactivo de un puesto
 */
router.delete('/:id/switch', authenticateToken, async (req, res) => {
  try {
    const puestoId = req.params.id;
    const [rows] = await pool.query(
      'SELECT puesto_active, nombre FROM puestos WHERE id = ?',
      [puestoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Puesto no encontrado' });
    }

    const [usuariosAsignados] = await pool.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE puesto_id = ?',
      [puestoId]
    );

    if (usuariosAsignados[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar el puesto porque tiene usuarios asignados'
      });
    }

    const nuevoValor = !rows[0].puesto_active;
    const name = rows[0].nombre;

    await pool.query(
      'UPDATE puestos SET puesto_active = ? WHERE id = ?',
      [nuevoValor, puestoId]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion:  3,
      modulo: 'Puestos',
      detalles: `ID: ${puestoId}, NOMBRE: ${name}`,
      req
    });

    res.json({ success: true, puesto_active: nuevoValor });

  } catch (error) {
    console.error('Error modificando puesto:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

module.exports = router;