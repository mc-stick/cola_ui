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
    const [rows] = await pool.query(
      `SELECT 
        id, tipo, url, nombre, activo, medio_active, orden, es_local, tamano_kb, created_at
       FROM medios 
       WHERE activo = TRUE 
       ORDER BY orden, created_at`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo medios:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/medios
 * Crear un nuevo medio (imagen o video)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tipo, url, nombre, orden, es_local, tamano_kb } = req.body;
    
    if (!tipo || !url || !nombre) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: tipo, url, nombre' 
      });
    }

    if (!['imagen', 'video'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido. Debe ser: imagen o video' 
      });
    }

    const urlLength = url.length;
    const isBase64 = url.startsWith('data:');

    if (isBase64) {
      if (tipo === 'imagen' && !url.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Base64 inválido para imagen' });
      }
      if (tipo === 'video' && !url.startsWith('data:video/')) {
        return res.status(400).json({ error: 'Base64 inválido para video' });
      }
    }

    const connection = await pool.getConnection();
    
    await connection.query("SET GLOBAL max_allowed_packet=1073741824");

    const [result] = await pool.query(
      `INSERT INTO medios 
       (tipo, url, nombre, orden, es_local, tamano_kb) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tipo, 
        url, 
        nombre, 
        orden || 0,
        es_local || isBase64,
        tamano_kb || Math.round(urlLength / 1024)
      ]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR MEDIO',
      modulo: 'Medios',
      detalles: `Tipo: ${tipo}, Nombre: ${nombre}, ID: ${result.insertId}`,
      req
    });
    
    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'Medio guardado correctamente'
    });
    
  } catch (error) {
    console.error('Error guardando medio:', error);
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ 
        error: 'El archivo es demasiado grande para almacenar' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al guardar medio: ' + error.message 
    });
  }
});

/**
 * PUT /api/medios/:id
 * Actualizar un medio existente
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, url, nombre, orden, activo, es_local, tamano_kb } = req.body;
    
    await pool.query(
      `UPDATE medios 
       SET tipo = ?, url = ?, nombre = ?, orden = ?, activo = ?, es_local = ?, tamano_kb = ?
       WHERE id = ?`,
      [tipo, url, nombre, orden, activo, es_local, tamano_kb, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}, Nombre: ${nombre}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/medios/:id
 * Desactivar un medio (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE medios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/medios/:id/switch
 * Alternar el estado activo/inactivo de un medio en pantalla
 */
router.delete('/:id/switch', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT medio_active, tipo, nombre FROM medios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'medio no encontrado' });
    }

    const nuevoValor = !rows[0].medio_active;
    const tipo = rows[0].tipo;
    const nombre = rows[0].nombre;

    await pool.query(
      'UPDATE medios SET medio_active = ? WHERE id = ?',
      [nuevoValor, req.params.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? `ACTIVAR MEDIO` : `DESACTIVAR MEDIO`,
      modulo: 'Medios',
      detalles: nuevoValor ? `Activó ${tipo} ${nombre} en pantalla` : `Desactivó ${tipo} ${nombre} en pantalla`,
      req
    });

    res.json({ success: true, medio_active: nuevoValor });
  } catch (error) {
    console.error('Error modificando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;