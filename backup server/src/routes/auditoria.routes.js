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
      FROM view_auditoria
      WHERE 1 = 1
    `;
    const params = [];

    if (fecha_inicio) {
      query += ' AND fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND fecha <= ?';
      params.push(fecha_fin);
    }

    if (usuario_id) {
      query += ' AND usuario_id = ?';
      params.push(usuario_id);
    }

    query += ' ORDER BY auditoria_id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo auditoría:', error);
    res.status(500).json({ error: error.message });
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
      SELECT h.*, t.finalizado_at, t.numero, u.nombre as usuario_nombre, s.nombre as servicio_nombre, t.transferido
      FROM historial h
      LEFT JOIN tickets t ON h.ticket_id = t.id
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE 1=1 AND s.service_active = 1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(t.finalizado_at) <= ?';
      params.push(fecha_fin);
    }
    
    if (servicio_id) {
      query += ' AND t.servicio_id = ?';
      params.push(servicio_id);
    }

    if (estado) {
      query += ' AND t.estado = ?';
      params.push(estado);
    }

    if (operador) {
      query += ' AND t.usuario_id = ?';
      params.push(operador);
    }
    
    query += ' ORDER BY h.created_at DESC LIMIT 1000';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;