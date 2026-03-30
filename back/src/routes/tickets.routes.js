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
    const id_persona = identificacion ?? "1";
    console.log(id_persona)
    const [result] = await pool.query(
      'CALL generar_numero_ticket(?, @numero)',
      [servicio_id]
    );
    
    const [[{ '@numero': numero }]] = await pool.query('SELECT @numero');
    
    const [insertResult] = await pool.query(
      'INSERT INTO tickets (numero, servicio_id, estado, id_persona) VALUES (?, ?, 1, ?)',
      [numero, servicio_id, id_persona]
    );
    
    // await pool.query(
    //   'INSERT INTO historial (ticket_id, accion) VALUES (?, ?)',
    //   [insertResult.insertId, 'creado']
    // );
    
    res.json({ 
      id: insertResult.insertId,
      numero,
      success: true 
    });
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * GET /api/tickets/espera
 * Obtener tickets en espera
 */
router.get('/espera', async (req, res) => { //ultima version
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vista_tickets WHERE estado = 1 ORDER BY created_at'
    );
   
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets en espera:', error);
    res.status(500).json({ error: "error del servidor"});
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
       WHERE estado IN ('2', '3') 
       ORDER BY created_at DESC 
       LIMIT 20`
    );
    
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets llamados:', error);
    res.status(500).json({ error: "error del servidor"});
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
    res.status(500).json({ error: "error del servidor"});
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
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * GET /api/tickets/operador/:usuario_id
 * Obtener tickets asignados a un operador
 */
router.get('/operador/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;  //Ultima version
    
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE usuario = ?
       AND estado NOT IN (4, 5, 6) 
       ORDER BY created_at DESC`,
      [usuario_id]
    );
     console.log(rows, "rows")
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo tickets del operador:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/tickets/:id/llamar
 * Llamar a un ticket
 */
router.post('/:id/llamar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id,puesto, servicio} = req.body;

    await pool.query(
      'CALL llamar_ticket(?, ?, ?,?)',
      [id, usuario_id, puesto,servicio]
    );

     const [rows] = await pool.query(`SELECT  ticket_id  FROM ticket_detail WHERE ticket_id=?`,
      [Number(id)] )

      if(rows.length === 0){

    await pool.query(`INSERT INTO ticket_detail(ticket_id, id_servicio, id_puesto, id_usuario, id_persona, op_comment, transferir, llamado_veces)
       VALUES (?,?,?,?,1,'',0,1)`,[Number(id),servicio,puesto,usuario_id] )}
    
    // await registrarAuditoria({
    //   usuarioId: req.user.id,
    //   accion: 7,
    //   modulo: 'Tickets',
    //   detalles: `Ticket ID: ${id}, Puesto ID: ${puesto}, Servicio ID: ${servicio}`,
    //   req
    // });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error llamando ticket:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

router.post('/:id/rellamar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id,puesto, servicio} = req.body;

     const [rows] = await pool.query(`select llamado_veces from ticket_detail where
    ticket_id = ? and
    id_servicio = ? and
    id_puesto = ? `,[Number(id),servicio,puesto] )

    

    await pool.query(`update ticket_detail set llamado_veces=? where
    ticket_id = ? and
    id_puesto = ? and
    id_servicio = ?`,[rows[0].llamado_veces+1,Number(id), puesto,servicio] )

    
    // await registrarAuditoria({
    //   usuarioId: req.user.id,
    //   accion: 7,
    //   modulo: 'Tickets',
    //   detalles: `Ticket ID: ${id}, Puesto ID: ${puesto}, Servicio ID: ${servicio}`,
    //   req
    // });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error llamando ticket:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

router.post('/:id/volver', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE tickets 
       SET estado = CASE
         WHEN created_at < NOW() - INTERVAL 10 HOUR THEN 'atendido'
         ELSE 'espera'
       END
       WHERE numero = ?
       AND estado = 'pendiente'`,
      [id]
    );

    const [rows] = await pool.query(
      `SELECT numero, estado 
       FROM tickets 
       WHERE numero = ?  ORDER by id DESC`,
      [id]
    );

    console.log(rows)

    if (rows.length === 0 || rows[0].estado!=='espera') {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    res.json({
      id: rows[0].numero,
      estado: rows[0].estado
    });

  } catch (error) {
    res.status(500).json({ error: "error del servidor" });
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
    
    // await registrarAuditoria({
    //   usuarioId: req.user.id,
    //   accion: 'ATENDER TICKET',
    //   modulo: 'Tickets',
    //   detalles: `Ticket ID: ${id}`,
    //   req
    // });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error atendiendo ticket:', error);
    res.status(500).json({ error: "error del servidor"});
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
      'CALL finalizar_ticket(?, ?)',
      [id,estado]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 3,
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}, Finalizado por operador.`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error finalizando ticket:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/tickets/:id/transferir
 * Transferir ticket a otro servicio
 */
router.post('/:id/transferir', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { servicio_nvo, usuario, servicio_act, comentario} = req.body;

    console.log(" ------------------------ Transferir ---------------------------",req.body)
    
    await pool.query(
      'CALL transferir(?,?,?,?)',
       [id, usuario, servicio_nvo, comentario]
     
    );
    //  UPDATE tickets SET estado=1 ,last_user=?, servicio=? WHERE id=?',
    //   [usuario,servicio_id, id]
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 6,
      modulo: 'Tickets',
      detalles: `Ticket ID: "${id}", Transferido.`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error transfiriendo ticket:', error);
    res.status(500).json({ error: "error del servidor"});
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
      'SELECT finalizado_at, expirado FROM tickets WHERE id=? AND estado=4',
      [id]
    );
    const ticket = rows[0];
    console.log("ya evaluado")
    if (!ticket) {
      return res.json({ success: true, expirado: false, yaEvaluado: false, notfound: true });
    }

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 50 * 60 * 1000);
    const expirado = ticket.expirado || expiradoPorTiempo;

    let evaltk=[];

    if (expirado && !ticket.expirado) {
      await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]);
      return res.json({
      success: true,
      expirado,
      yaEvaluado: ticket.evaluation > 0,
      notfound: false
      });
    }else{
     evaltk = await pool.query(`SELECT 
s.nombre,
td.ticket_id,
td.id_servicio
FROM ticket_detail td 
join servicios s on s.id=td.id_servicio
WHERE td.ticket_id=? `,[id]);

console.log(evaltk)

return res.json({
  data: evaltk,
      success: true,
      expirado,
      yaEvaluado: ticket.evaluation > 0,
      notfound: false
      });
    }

    
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
    const { evaluation, comment } = req.body;

    console.log(evaluation, "evaluacion")

    const [rows] = await pool.query(
      'SELECT finalizado_at, expirado FROM tickets WHERE id=?',
      [id]
    );
    const ticket = rows[0];
    console.log(ticket)
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket no encontrado" });
    }

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 50 * 60 * 1000);
    if (ticket.expirado || expiradoPorTiempo) {
      if (!ticket.expirado) {
        await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]);
      }
      return res.status(400).json({ success: false, message: "Ticket expirado" });
    }

    if (ticket.evaluation > 0) {
      return res.status(400).json({ success: false, message: "Ticket ya evaluado" });
    }

    await pool.query('UPDATE tickets SET  expirado=1, cli_comment=? WHERE id=?', [comment, id]);

    const [data]= await pool.query(`SELECT * FROM ticket_detail WHERE ticket_id=?`,[id])

   for (const stars of evaluation) {
  await pool.query(
    `INSERT INTO evaluacion (
      ticket_id,
      id_persona,
      id_user,
      id_servicio,
      estrellas
    )
    VALUES (?,?,?,?,?)`,
    [
      id,
      data[0]?.id_persona,
      data[0]?.id_usuario,
      data[0]?.id_servicio,
      stars
    ]
  );
}
    

    res.json({ success: true, message: "Evaluación registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

module.exports = router;