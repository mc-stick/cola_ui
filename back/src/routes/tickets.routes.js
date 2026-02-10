const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/tickets
 * Crear un nuevo ticket
 */
router.post('/', async (req, res) => {
  try {
    const { servicio_id, tipo_identificacion, identificacion } = req.body;
    
    const [result] = await pool.query(
      'CALL generar_numero_ticket(?, @numero)',
      [servicio_id]
    );
    
    const [[{ '@numero': numero }]] = await pool.query('SELECT @numero');
    
    const [insertResult] = await pool.query(
      'INSERT INTO tickets (numero, servicio_id, tipo_identificacion, identificacion) VALUES (?, ?, ?, ?)',
      [numero, servicio_id, tipo_identificacion, identificacion]
    );
    
    await pool.query(
      'INSERT INTO historial (ticket_id, accion) VALUES (?, ?)',
      [insertResult.insertId, 'creado']
    );
    
    res.json({ 
      id: insertResult.insertId,
      numero,
      success: true 
    });
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/espera
 * Obtener tickets en espera
 */
router.get('/espera', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vista_tickets WHERE estado = "espera" ORDER BY created_at'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets en espera:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/llamados
 * Obtener últimos tickets llamados
 */
router.get('/llamados', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE estado IN ('llamado', 'en_atencion') 
       ORDER BY llamado_at DESC 
       LIMIT 5`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets llamados:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/evaluado-stats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN evaluation != 0 THEN 1 ELSE 0 END) AS evaluados,
        SUM(CASE WHEN evaluation = 0 THEN 1 ELSE 0 END) AS no_evaluados
      FROM tickets;

`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets llamados:', error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/evaluado-user', async (req, res) => {
  try {
    const [rows] = await pool.query(
      ` SELECT 
          usuario_id,
          evaluation
      FROM tickets
      WHERE evaluation != 0 AND estado ='atendido'
      ORDER BY llamado_at DESC`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets llamados:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/operador/:usuario_id
 * Obtener tickets asignados a un operador
 */
router.get('/operador/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE usuario_id = ?
       AND estado NOT IN ('atendido', 'no_presentado', 'cancelado') 
       ORDER BY created_at DESC`,
      [usuario_id]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets del operador:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/:id/llamar
 * Llamar a un ticket
 */
router.post('/:id/llamar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, puesto_id } = req.body;
    
    await pool.query(
      'CALL llamar_ticket(?, ?, ?)',
      [id, usuario_id, puesto_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'LLAMAR TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}, Puesto ID: ${puesto_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error llamando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/volver', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, puesto_id } = req.body;
    
    await pool.query(
      `UPDATE tickets SET estado = CASE
  WHEN created_at < NOW() - INTERVAL 12 HOUR THEN 'atendido'
  ELSE 'espera'
END
WHERE numero = ?
  AND estado = 'pendiente"
 `,
      [id]
    ); // modificar consulta.
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'LLAMAR TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}, Puesto ID: ${puesto_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error llamando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/:id/atender
 * Marcar ticket como en atención
 */
router.post('/:id/atender', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;
    
    await pool.query('CALL atender_ticket(?, ?)', [id, usuario_id]);
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ATENDER TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error atendiendo ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/:id/finalizar
 * Finalizar atención de un ticket
 */
router.post('/:id/finalizar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, estado, comentario } = req.body;
    
    await pool.query(
      'CALL finalizar_ticket(?, ?, ?, ?)',
      [id, usuario_id, estado, comentario]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'FINALIZAR TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}, Estado: ${estado}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error finalizando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tickets/:id/transferir
 * Transferir ticket a otro servicio
 */
router.post('/:id/transferir', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { servicio_id, comentario,serv_ant,servicio_nm } = req.body;
    
    await pool.query(
      'UPDATE tickets SET servicio_id=?, notes=?, estado="espera", puesto_id=null, usuario_id=null, transferido=1 WHERE id=?',
      [servicio_id, comentario, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'TRANSFERIR TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: "${id}", Transferido de: "${serv_ant}", hasta: "${servicio_nm}"`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error transfiriendo ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tickets/:id/estado-evaluacion
 * Verificar si un ticket puede ser evaluado
 */
router.get('/:id/estado-evaluacion', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id=? AND estado="atendido"',
      [id]
    );
    const ticket = rows[0];
    
    if (!ticket) {
      return res.json({ success: true, expirado: false, yaEvaluado: false, notfound: true });
    }

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 30 * 60 * 1000);
    const expirado = ticket.expirado || expiradoPorTiempo;

    if (expirado && !ticket.expirado) {
      await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]);
    }

    res.json({
      success: true,
      expirado,
      yaEvaluado: ticket.evaluation > 0,
      notfound: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

/**
 * POST /api/tickets/:id/evaluar
 * Enviar evaluación de un ticket
 */
router.post('/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluation } = req.body;

    const [rows] = await pool.query(
      'SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id=?',
      [id]
    );
    const ticket = rows[0];
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    }

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 30 * 60 * 1000);
    if (ticket.expirado || expiradoPorTiempo) {
      if (!ticket.expirado) {
        await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]);
      }
      return res.status(400).json({ success: false, message: "Ticket expirado" });
    }

    if (ticket.evaluation > 0) {
      return res.status(400).json({ success: false, message: "Ticket ya evaluado" });
    }

    await pool.query('UPDATE tickets SET evaluation=?, expirado=1 WHERE id=?', [evaluation, id]);

    res.json({ success: true, message: "Evaluación registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;