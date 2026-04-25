const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

/**
 * GET /api/estadisticas
 * Estadísticas del día
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
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/estadisticas/rango
 * Estadísticas por rango de fechas
 */
router.get('/rango', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
    COUNT(t.id) AS total_tickets,
    SUM(CASE WHEN t.estado = 4 THEN 1 ELSE 0 END) AS atendidos,
    SUM(CASE WHEN t.estado = 5 THEN 1 ELSE 0 END) AS no_presentados,
    SUM(CASE WHEN t.estado = 1 THEN 1 ELSE 0 END) AS en_espera,
    -- Subconsulta filtrada por el mismo rango de fechas
    (SELECT COUNT(DISTINCT sub.ticket_id) 
     FROM ticket_detail sub
     JOIN tickets t_sub ON sub.ticket_id = t_sub.id
     WHERE sub.transferir = 1 
     AND DATE(t_sub.created_at) BETWEEN ? AND ?) AS tickets_transferidos,
    SUM(CASE WHEN t.estado IN (2, 3) THEN 1 ELSE 0 END) AS en_proceso,
    AVG(
        CASE 
            WHEN t.estado = 4 AND t.finalizado_at IS NOT NULL AND t.created_at IS NOT NULL
            THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.finalizado_at)
        END
    ) AS tiempo_promedio_servicio
FROM tickets t
WHERE DATE(t.created_at) BETWEEN ? AND ?
      `;
    const [rows] = await pool.query(query, [inicio, fin,inicio, fin]);
    console.log(rows,'renge')
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por rango:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/estadisticas/servicios
 * Estadísticas por servicio
 */
router.get('/servicios', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        s.id, s.nombre, s.codigo, s.color, s.activo AS service_active,
        COUNT(t.id) AS total_tickets,
        SUM(CASE WHEN t.estado = 4 THEN 1 ELSE 0 END) AS atendidos,
        SUM(CASE WHEN t.estado = 5 THEN 1 ELSE 0 END) AS no_presentados,
        AVG(
          CASE
            WHEN t.estado = 4 AND t.finalizado_at IS NOT NULL
            THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.finalizado_at)
          END
        ) AS tiempo_promedio_servicio
      FROM servicios s
      LEFT JOIN tickets t 
        ON s.id = t.servicio_id
        AND DATE(t.created_at) BETWEEN ? AND ?
      WHERE s.activo = TRUE
      GROUP BY s.id, s.nombre, s.codigo, s.color
      ORDER BY total_tickets DESC
    `;

    const [rows] = await pool.query(query, [inicio, fin]);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por servicio:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/estadisticas/operadores
 * Estadísticas por operador incluyendo evaluaciones
 */
router.get('/operadores', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const query = `
SELECT 
    u.id, 
    u.username, 
    per.name AS nombre, -- Campo agregado de la tabla persona
    p.numero AS puesto_numero,
    COUNT(t.id) AS total_tickets,
    SUM(CASE WHEN t.estado = 4 THEN 1 ELSE 0 END) AS atendidos,
    SUM(CASE WHEN t.estado = 5 THEN 1 ELSE 0 END) AS no_presentados,
    AVG(
        CASE 
            WHEN t.estado = 4 AND t.finalizado_at IS NOT NULL
            THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.finalizado_at)
        END
    ) AS tiempo_promedio_servicio,
    COALESCE(ev.evaluados, 0) AS evaluados,
    COALESCE(ev.promedio_evaluacion, 0) AS promedio_evaluacion
FROM usuarios u
-- Unimos la tabla persona usando id_persona
INNER JOIN persona per ON u.id_persona = per.id_persona 
LEFT JOIN puestos p ON u.puesto_id = p.id
LEFT JOIN tickets t ON u.id = t.usuario_id 
    AND DATE(t.created_at) BETWEEN ? AND ?
LEFT JOIN (
    SELECT 
        t.usuario_id,
        COUNT(e.id) AS evaluados,
        ROUND(AVG(e.estrellas), 2) AS promedio_evaluacion
    FROM tickets t
    JOIN evaluacion e ON e.ticket_id = t.id
    WHERE t.estado = 4
    AND DATE(t.created_at) BETWEEN ? AND ?
    GROUP BY t.usuario_id
) ev ON ev.usuario_id = u.id
WHERE u.rol = 2 AND u.activo = TRUE
GROUP BY 
    u.id, 
    u.username, 
    per.name, -- Agregado al GROUP BY
    p.numero, 
    ev.evaluados, 
    ev.promedio_evaluacion
ORDER BY total_tickets DESC;
    `;

    const [rows] = await pool.query(query, [inicio, fin,inicio, fin]);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por operador:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/estadisticas/horas
 */
router.get('/horas', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    const query = `
     SELECT 
        HOUR(created_at) AS hora,
        COUNT(*) AS total_tickets,
        SUM(CASE WHEN estado = 4 THEN 1 ELSE 0 END) AS atendidos,
        SUM(CASE WHEN estado = 5 THEN 1 ELSE 0 END) AS no_presentados
      FROM tickets
      WHERE DATE(created_at) >= ?
      GROUP BY HOUR(created_at)
      ORDER BY hora
    `;

    const [rows] = await pool.query(query, [fechaConsulta]);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por hora:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

/**
 * GET /api/estadisticas/resumen
 */
router.get('/resumen', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        COUNT(*) AS total_tickets,
        SUM(CASE WHEN estado = 4 THEN 1 ELSE 0 END) AS atendidos,
        SUM(CASE WHEN estado = 5 THEN 1 ELSE 0 END) AS no_presentados,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS en_espera,
        SUM(CASE WHEN transferir = 1 THEN 1 ELSE 0 END) AS transferidos,
        SUM(CASE WHEN estado IN (2,3) THEN 1 ELSE 0 END) AS en_proceso
      FROM ticket_detail td
       JOIN tickets t ON t.id = td.ticket_id
      WHERE DATE(t.created_at) BETWEEN ? AND ?
    `;

    const [rows] = await pool.query(query, [inicio, fin]);
    res.json(rows[0] || {
      total_tickets: 0,
      atendidos: 0,
      no_presentados: 0,
      en_espera: 0,
      en_proceso: 0,
      tiempo_promedio_servicio: 0,
      transferidos: 0
    });
  } catch (error) {
    console.error('Error obteniendo resumen general:', error);
    res.status(500).json({ error: 'error del servidor' });
  }
});

module.exports = router;