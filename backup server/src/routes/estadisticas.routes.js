const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

/**
 * GET /api/estadisticas
 * Obtener estadísticas diarias
 */
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    
    const [stats] = await pool.query(
      'SELECT * FROM estadisticas_diarias WHERE fecha = ?',
      [fechaConsulta]
    );
    
    res.json(stats[0] || {
      fecha: fechaConsulta,
      total_tickets: 0,
      atendidos: 0,
      no_presentados: 0,
      en_espera: 0,
      tiempo_promedio: 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/estadisticas/rango
 * Obtener estadísticas por rango de fechas
 */
router.get('/rango', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
     
    const query = `
      SELECT 
        DATE(t.created_at) as fecha,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados,
        SUM(CASE WHEN estado = 'espera' THEN 1 ELSE 0 END) as en_espera,
        SUM(CASE WHEN estado IN ('llamado', 'en_atencion') THEN 1 ELSE 0 END) as en_proceso,
        AVG(CASE 
          WHEN estado = 'atendido' AND atendido_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, atendido_at)
          ELSE NULL 
        END) as tiempo_promedio_servicio
      FROM tickets t
      LEFT JOIN servicios s ON s.id = t.servicio_id AND s.service_active = 1
      WHERE DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY DATE(t.created_at)
      ORDER BY fecha ASC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por rango:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/estadisticas/servicios
 * Obtener estadísticas por servicio
 */
router.get('/servicios', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        s.id, s.nombre, s.codigo, s.color, s.service_active,
        COALESCE(COUNT(t.id), 0) AS total_tickets,
        COALESCE(SUM(CASE WHEN t.estado = 'atendido' THEN 1 END), 0) AS atendidos,
        COALESCE(SUM(CASE WHEN t.estado = 'no_presentado' THEN 1 END), 0) AS no_presentados,
        COALESCE(
          AVG(
            CASE 
              WHEN t.estado = 'atendido'
               AND t.llamado_at IS NOT NULL
               AND t.finalizado_at IS NOT NULL
               AND t.finalizado_at > t.llamado_at
              THEN TIMESTAMPDIFF(MINUTE, t.llamado_at, t.finalizado_at)
            END
          ), 0
        ) AS tiempo_promedio_servicio
      FROM servicios s
      LEFT JOIN tickets t 
        ON s.id = t.servicio_id
        AND t.created_at BETWEEN ? AND ?
      WHERE s.activo = TRUE
      GROUP BY s.id, s.nombre, s.codigo, s.color
      ORDER BY total_tickets DESC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/estadisticas/operadores
 * Obtener estadísticas por operador
 */
router.get('/operadores', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
        
    const query = `
      SELECT 
        u.id, u.nombre, p.numero AS puesto_numero,
        COALESCE(COUNT(t.id), 0) AS total_tickets,
        COALESCE(SUM(CASE WHEN t.estado = 'atendido' THEN 1 END), 0) AS atendidos,
        COALESCE(SUM(CASE WHEN t.estado = 'no_presentado' THEN 1 END), 0) AS no_presentados,
        AVG(
          CASE 
            WHEN t.estado = 'atendido'
            AND t.llamado_at IS NOT NULL
            AND t.finalizado_at IS NOT NULL
            AND t.finalizado_at > t.llamado_at
            THEN TIMESTAMPDIFF(MINUTE, t.llamado_at, t.finalizado_at)
          END
        ) AS tiempo_promedio_servicio
      FROM usuarios u
      LEFT JOIN puestos p ON u.puesto_id = p.id
      LEFT JOIN tickets t 
        ON u.id = t.usuario_id
        AND DATE(t.created_at) >= ?
        AND DATE(t.finalizado_at) <= ?
      WHERE u.rol = 'operador' AND u.activo = TRUE
      GROUP BY u.id, u.nombre, p.numero
      ORDER BY total_tickets DESC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por operador:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/estadisticas/horas
 * Obtener estadísticas por hora del día
 */
router.get('/horas', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
        
    const query = `
      SELECT 
        HOUR(created_at) as hora,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados
      FROM tickets
      WHERE DATE(created_at) = ?
      GROUP BY HOUR(created_at)
      ORDER BY hora
    `;
    
    const [rows] = await pool.query(query, [fechaConsulta]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por hora:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/estadisticas/resumen
 * Obtener resumen general de estadísticas
 */
router.get('/resumen', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados,
        SUM(CASE WHEN estado = 'espera' THEN 1 ELSE 0 END) as en_espera,
        SUM(CASE WHEN transferido = 1 THEN 1 ELSE 0 END) as transferido,
        SUM(CASE WHEN estado IN ('llamado', 'en_atencion') THEN 1 ELSE 0 END) as en_proceso,
        AVG(CASE 
          WHEN estado = 'atendido' AND finalizado_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, llamado_at, finalizado_at)
          ELSE 0 
        END) as tiempo_promedio_servicio,
        AVG(CASE 
          WHEN estado = 'atendido' AND llamado_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, created_at, llamado_at)
          ELSE 0 
        END) as tiempo_promedio_espera,
        MIN(created_at) as primer_ticket,
        MAX(created_at) as ultimo_ticket
      FROM tickets
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
        
    res.json(rows[0] || {
      total_tickets: 0,
      atendidos: 0,
      no_presentados: 0,
      en_espera: 0,
      en_proceso: 0,
      tiempo_promedio_servicio: 0,
      transferidos: null,
      primer_ticket: null,
      ultimo_ticket: null
    });

  } catch (error) {
    console.error('Error obteniendo resumen general:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;