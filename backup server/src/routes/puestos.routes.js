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
      'SELECT * FROM puestos WHERE activo = TRUE ORDER BY numero'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo puestos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/puestos
 * Crear un nuevo puesto
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { numero, nombre } = req.body;

    const numeroStr = numero != null ? numero.toString().trim() : '';
    const nombreStr = nombre != null ? nombre.toString().trim() : '';

    if (!numeroStr || !nombreStr) {
      return res.status(400).json({
        error: 'Número o nombre no pueden estar vacíos'
      });
    }

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE numero = ? OR nombre = ?',
      [numeroStr, nombreStr]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un puesto con el mismo número o nombre'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO puestos (numero, nombre) VALUES (?, ?)',
      [numeroStr, nombreStr]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR PUESTO',
      modulo: 'Puestos',
      detalles: `Número: ${numeroStr}, Nombre: ${nombreStr}, ID: ${result.insertId}`,
      req
    });

    res.json({ id: result.insertId, success: true });

  } catch (error) {
    console.error('Error creando puesto:', error);
    res.status(500).json({ error: error.message });
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

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE (numero = ? OR nombre = ?) AND id != ?',
      [numero, nombre, id]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe otro puesto con el mismo número o nombre'
      });
    }

    await pool.query(
      'UPDATE puestos SET numero = ?, nombre = ?, activo = ? WHERE id = ?',
      [numero, nombre, activo, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${id}, Número: ${numero}, Nombre: ${nombre}`,
      req
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error actualizando puesto:', error);
    res.status(500).json({ error: error.message });
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
      accion: nuevoValor ? 'ACTIVAR PUESTO' : 'DESACTIVAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${puestoId}, NOMBRE: ${name}`,
      req
    });

    res.json({ success: true, puesto_active: nuevoValor });

  } catch (error) {
    console.error('Error modificando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;