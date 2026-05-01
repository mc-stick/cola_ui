const express = require('express');
const { pool } = require('../config/database');
const { sendError, sendSuccess, asyncHandler } = require('../utils/errorHandler');
const { validateRequired } = require('../utils/validator');

const router = express.Router();

/**
 * GET /api/auditoria
 * Obtener registros de auditoría con filtros opcionales
 */
router.get('/auditoria', asyncHandler(async (req, res) => {
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

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch audit records', error);
  }
}));

/**
 * GET /api/historial
 * Obtener historial de tickets con filtros opcionales
 */
router.get('/historial', asyncHandler(async (req, res) => {
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
    }
    
    if (servicio_id) {
      query += ' AND servicio = ?';
      params.push(servicio_id);
    }

    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY id DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch ticket history', error);
  }
}));

router.get('/historial/:id', asyncHandler(async (req, res) => {
  try {
    const  id  = req.params.id;
   
    let query = `
      SELECT * FROM vista_ticket_detail WHERE Identificador= ?
    `;
    
    const params = [id];
    
    query += ' ORDER BY Identificador DESC LIMIT 50';
    
    const [rows] = await pool.query(query, params);
    
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, 'DATABASE_ERROR', 'Failed to fetch ticket details', error);
  }
}));

module.exports = router;