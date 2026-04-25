const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

/**
 * GET /api/auditoria
 * Obtener registros de auditoría con filtros opcionales
 */
router.get('/auditoria', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, usuario_id } = req.query;
    let query = `
      SELECT *
      FROM vista_auditoria
      WHERE 1 = 1
    `;
    const params = [];

    if (fecha_inicio) {
      query += ' AND fecha >= ?';
      params.push(fecha_inicio+" 00:00:00");
    }

    if (fecha_fin) {
      query += ' AND fecha <= ?';
      params.push(fecha_fin+" 23:00:00");
    }

    if (usuario_id) {
      query += ' AND id_user = ? ';
      params.push(usuario_id);
    }
    console.log("first, ",fecha_fin, fecha_inicio)

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo auditoría:', error);
    res.status(500).json({ error: "error del servidor" });
  }
});

/**
 * GET /api/historial
 * Obtener historial de tickets con filtros opcionales
 */
router.get('/historial', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, servicio_id, estado, operador } = req.query;
   
   
    
    let query = `
      SELECT * FROM vista_tickets WHERE 1=1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND created_at >= ?';
      params.push(fecha_inicio+"T00:00:00.000Z");
    }
    
    if (fecha_fin && estado!="1") {
      query += ' AND finalizado_at <= ?';
      params.push(fecha_fin+"T23:59:56.000Z");
      console.log('fecha fin history',fecha_fin)
    }
    
    if (servicio_id) {
      query += ' AND servicio = ?';
      params.push(servicio_id);
    }

    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    // if (operador) {
    //   query += ' AND t.usuario_id = ?';
    //   params.push(operador);
    // }
    
    query += ' ORDER BY id DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    console.log('params', params)
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: "error del servidor" });
  }
});


router.get('/historial/:id', async (req, res) => {
  try {
    const  id  = req.params.id;
   
    

    let query = `
      SELECT * FROM vista_ticket_detail WHERE Identificador= ?
    `;
    
    const params = [id];
    
    
    query += ' ORDER BY Identificador DESC LIMIT 50';
    
    const [rows] = await pool.query(query, params);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: "error del servidor" });
  }
});

module.exports = router;