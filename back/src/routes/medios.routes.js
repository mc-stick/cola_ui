const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/medios
 * Obtener todos los medios activos
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        tipo,
        url,
        nombre,
        activo,
        medio_active,
        tamano_kb,
        created_at
      FROM medios
      WHERE activo = 1
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error('Error obteniendo medios:', error);

    res.status(500).json({
      error: 'Error del servidor'
    });
  }
});

/**
 * POST /api/medios
 * Crear un nuevo medio
 */
router.post('/', authenticateToken, async (req, res) => {
  try {

    const {
      tipo,
      url,
      nombre,
      tamano_kb
    } = req.body;

    // Validaciones
    if (!tipo || !url || !nombre) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: tipo, url, nombre'
      });
    }

    if (!['imagen', 'video'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido'
      });
    }

    if (typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL inválida'
      });
    }

    const isBase64 = url.startsWith('data:');

    // Validar formato base64
    if (isBase64) {

      if (tipo === 'imagen' && !url.startsWith('data:image/')) {
        return res.status(400).json({
          error: 'Base64 inválido para imagen'
        });
      }

      if (tipo === 'video' && !url.startsWith('data:video/')) {
        return res.status(400).json({
          error: 'Base64 inválido para video'
        });
      }
    }

    // Tamaño calculado automáticamente
    const sizeKB =
      tamano_kb ??
      Math.round(url.length / 1024);

    // Insertar
    const [result] = await pool.query(
      `
      INSERT INTO medios
      (
        tipo,
        url,
        nombre,
        tamano_kb
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        tipo,
        url,
        nombre,
        sizeKB
      ]
    );

    // Auditoría
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR MEDIO',
      modulo: 'Medios',
      detalles: `Tipo: ${tipo}, Nombre: ${nombre}, ID: ${result.insertId}`,
      req
    });

    res.json({
      success: true,
      id: result.insertId,
      message: 'Medio guardado correctamente'
    });

  } catch (error) {

    console.error('Error guardando medio:', error);

    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande'
      });
    }

    res.status(500).json({
      error: 'Error al guardar medio'
    });
  }
});

/**
 * PUT /api/medios/:id
 * Actualizar medio
 */
router.put('/:id', authenticateToken, async (req, res) => {

  try {

    const { id } = req.params;

    const {
      medio_active
    } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const [result] = await pool.query(
      `
      UPDATE medios
      SET
        medio_active = ?
      WHERE id = ?
      `,
      [
        medio_active,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Medio no encontrado'
      });
    }

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}, Nombre: ${nombre}`,
      req
    });

    res.json({
      success: true
    });

  } catch (error) {

    console.error('Error actualizando medio:', error);

    res.status(500).json({
      error: 'Error del servidor'
    });
  }
});

/**
 * DELETE /api/medios/:id
 * Soft delete
 */
router.delete('/:id', authenticateToken, async (req, res) => {

  try {

    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const [result] = await pool.query(
      `
      UPDATE medios
      SET activo = 0
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Medio no encontrado'
      });
    }

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}`,
      req
    });

    res.json({
      success: true
    });

  } catch (error) {

    console.error('Error eliminando medio:', error);

    res.status(500).json({
      error: 'Error del servidor'
    });
  }
});

/**
 * PATCH /api/medios/:id/switch
 * Activar/desactivar en pantalla
 */
router.put('/:id/switch', authenticateToken, async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        medio_active,
        tipo,
        nombre
      FROM medios
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Medio no encontrado'
      });
    }

    const medio = rows[0];

    const nuevoValor =
      medio.medio_active === 1 ? 0 : 1;

    await pool.query(
      `
      UPDATE medios
      SET medio_active = ?
      WHERE id = ?
      `,
      [nuevoValor, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor
        ? 'ACTIVAR MEDIO'
        : 'DESACTIVAR MEDIO',
      modulo: 'Medios',
      detalles: `${medio.tipo} ${medio.nombre}`,
      req
    });

    res.json({
      success: true,
      medio_active: nuevoValor
    });

  } catch (error) {

    console.error('Error modificando medio:', error);

    res.status(500).json({
      error: 'Error del servidor'
    });
  }
});

module.exports = router;