const express = require("express");
const { pool } = require("../config/database");
const { registrarAuditoria } = require("../utils/auditoria");
const { authenticateToken } = require("../middleware/auth");
const { sendError, sendSuccess, asyncHandler } = require("../utils/errorHandler");
const { validateRequired, isValidId } = require("../utils/validator");

const router = express.Router();

/**
 * POST /api/tickets
 * Crear un nuevo ticket
 */
router.post("/", asyncHandler(async (req, res) => {
  const { servicio_id, identificacion } = req.body;

  // Validate required fields
  const validation = validateRequired(req.body, ["servicio_id"]);
  if (!validation.valid) {
    return sendError(res, "VALIDATION_ERROR", `Missing fields: ${validation.missingFields.join(", ")}`);
  }

  if (!servicio_id?.id) {
    return sendError(res, "VALIDATION_ERROR", "servicio_id.id is required");
  }

  const id_persona = identificacion && identificacion.length === 8 ? identificacion : "1";

  try {
    const [result] = await pool.query(
      "CALL generar_numero_ticket(?, @numero)",
      [servicio_id.id],
    );

    const [[{ "@numero": numero }]] = await pool.query("SELECT @numero");

    const [insertResult] = await pool.query(
      "INSERT INTO tickets (numero, servicio_id, estado, id_persona, priority) VALUES (?, ?, 1, ?, ?)",
      [numero, servicio_id.id, id_persona, servicio_id.dar_prioridad],
    );

    res.json({
      id: insertResult.insertId,
      numero,
      success: true,
    });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to create ticket", error);
  }
}));

/**
 * GET /api/tickets/espera
 * Obtener tickets en espera
 */
router.get("/espera", asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM vista_tickets WHERE estado = 1 ORDER BY created_at",
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to fetch waiting tickets", error);
  }
}));

/**
 * GET /api/tickets/llamados
 * Obtener últimos tickets llamados
 */
router.get("/llamados", asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vista_ticket_llamado
       WHERE estado IN ('2', '3') 
       ORDER BY created_at DESC 
       LIMIT 20`,
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to fetch called tickets", error);
  }
}));

/**
 * GET /api/tickets/evaluado-stats
 * Obtener estadísticas de evaluación de tickets
 */
router.get("/evaluado-stats", asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN evaluation != 0 THEN 1 ELSE 0 END) AS evaluados,
        SUM(CASE WHEN evaluation = 0 THEN 1 ELSE 0 END) AS no_evaluados   
      FROM tickets`,
    );
    sendSuccess(res, rows[0]);
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to fetch evaluation stats", error);
  }
}));

/**
 * GET /api/tickets/evaluado-user
 * Obtener tickets evaluados por usuario
 */
router.get("/evaluado-user", asyncHandler(async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        usuario_id,
        evaluation
      FROM tickets
      WHERE evaluation != 0 AND estado = 'atendido'
      ORDER BY llamado_at DESC`,
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to fetch user evaluations", error);
  }
}));

/**
 * GET /api/tickets/operador/:usuario_id
 * Obtener tickets asignados a un operador
 */
router.get("/operador/:usuario_id", asyncHandler(async (req, res) => {
  const { usuario_id } = req.params;

  if (!isValidId(usuario_id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid usuario_id format");
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE usuario = ?
       AND estado NOT IN (4, 5, 6) 
       ORDER BY created_at DESC`,
      [usuario_id],
    );
    sendSuccess(res, rows);
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to fetch operator tickets", error);
  }
}));

/**
 * POST /api/tickets/:id/llamar
 * Llamar a un ticket
 */
router.post("/:id/llamar", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usuario_id, puesto, servicio } = req.body;

  const validation = validateRequired(req.body, ["usuario_id", "puesto", "servicio"]);
  if (!validation.valid) {
    return sendError(res, "VALIDATION_ERROR", `Missing fields: ${validation.missingFields.join(", ")}`);
  }

  if (!isValidId(id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid ticket ID");
  }

  try {
    await pool.query("CALL llamar_ticket(?, ?, ?, ?)", [
      id,
      usuario_id,
      puesto,
      servicio,
    ]);

    const [rows] = await pool.query(
      `SELECT ticket_id FROM ticket_detail WHERE ticket_id = ?`,
      [Number(id)],
    );

    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO ticket_detail (ticket_id, id_servicio, id_puesto, id_usuario, id_persona, op_comment, transferir, llamado_veces)
         VALUES (?, ?, ?, ?, 1, '', 0, 1)`,
        [Number(id), servicio, puesto, usuario_id],
      );
    }

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to call ticket", error);
  }
}));

/**
 * POST /api/tickets/:id/rellamar
 * Re-llamar a un ticket
 */
router.post("/:id/rellamar", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usuario_id, puesto, servicio } = req.body;

  const validation = validateRequired(req.body, ["usuario_id", "puesto", "servicio"]);
  if (!validation.valid) {
    return sendError(res, "VALIDATION_ERROR", `Missing fields: ${validation.missingFields.join(", ")}`);
  }

  if (!isValidId(id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid ticket ID");
  }

  try {
    const [rows] = await pool.query(
      `SELECT llamado_veces FROM ticket_detail 
       WHERE ticket_id = ? AND id_servicio = ? AND id_puesto = ?`,
      [Number(id), servicio, puesto],
    );

    if (rows.length === 0) {
      return sendError(res, "NOT_FOUND", "Ticket detail not found");
    }

    await pool.query(
      `UPDATE ticket_detail SET llamado_veces = ? 
       WHERE ticket_id = ? AND id_puesto = ? AND id_servicio = ?`,
      [rows[0].llamado_veces + 1, Number(id), puesto, servicio],
    );

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to recall ticket", error);
  }
}));

/**
 * POST /api/tickets/:id/volver
 * Devolver ticket a estado anterior
 */
router.post("/:id/volver", asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, "VALIDATION_ERROR", "Ticket ID is required");
  }

  try {
    await pool.query(
      `UPDATE tickets 
       SET estado = CASE
         WHEN created_at < NOW() - INTERVAL 10 HOUR THEN 4
         ELSE 1
       END
       WHERE numero = ? AND estado = 7`,
      [id],
    );

    const [rows] = await pool.query(
      `SELECT numero, estado FROM tickets WHERE numero = ? ORDER BY id DESC LIMIT 1`,
      [id],
    );

    if (rows.length === 0 || rows[0].estado !== 1) {
      return sendError(res, "NOT_FOUND", "Ticket not found or invalid state");
    }

    sendSuccess(res, {
      id: rows[0].numero,
      estado: rows[0].estado,
    });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to return ticket", error);
  }
}));

/**
 * POST /api/tickets/:id/atender
 * Marcar ticket como en atención
 */
router.post("/:id/atender", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  if (!id || !usuario_id) {
    return sendError(res, "VALIDATION_ERROR", "ID and usuario_id are required");
  }

  try {
    await pool.query("CALL atender_ticket(?, ?)", [id, usuario_id]);
    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to attend ticket", error);
  }
}));

/**
 * POST /api/tickets/:id/finalizar
 * Finalizar atención de un ticket
 */
router.post("/:id/finalizar", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { usuario_id, estado, comentario, nopresentado } = req.body;

  if (!id || !estado) {
    return sendError(res, "VALIDATION_ERROR", "ID and estado are required");
  }

  try {
    await pool.query("CALL finalizar_ticket(?, ?)", [id, estado]);

    if (nopresentado) {
      await pool.query("UPDATE tickets SET expirado = 1 WHERE id = ?", [id]);
    }

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 3,
      modulo: "Tickets",
      detalles: `Ticket ID: ${id}, Finalizado por operador.`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to finalize ticket", error);
  }
}));

/**
 * POST /api/tickets/:id/transferir
 * Transferir ticket a otro servicio
 */
router.post("/:id/transferir", authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { servicio_nvo, usuario, comentario } = req.body;

  const validation = validateRequired(req.body, ["servicio_nvo", "usuario"]);
  if (!validation.valid) {
    return sendError(res, "VALIDATION_ERROR", `Missing fields: ${validation.missingFields.join(", ")}`);
  }

  if (!isValidId(id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid ticket ID");
  }

  try {
    await pool.query("CALL transferir(?, ?, ?, ?)", [
      id,
      usuario,
      servicio_nvo,
      comentario || null,
    ]);

    const [serviceRows] = await pool.query(
      "SELECT nombre FROM servicios WHERE id = ?",
      [servicio_nvo],
    );

    const [ticketRows] = await pool.query(
      "SELECT numero FROM tickets WHERE id = ?",
      [id],
    );

    const serviceName = serviceRows[0]?.nombre || "Unknown";
    const ticketNumber = ticketRows[0]?.numero || id;

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 6,
      modulo: "Tickets",
      detalles: `Ticket ID: "${id}", Número: "${ticketNumber}", Transferido a: "${serviceName}"`,
    });

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to transfer ticket", error);
  }
}));

/**
 * GET /api/tickets/:id/estado-evaluacion
 * Verificar si un ticket puede ser evaluado
 */
router.get("/:id/estado-evaluacion", asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid ticket ID");
  }

  try {
    const [rows] = await pool.query(
      "SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id = ? AND estado = 4",
      [id],
    );

    if (rows.length === 0) {
      return sendSuccess(res, {
        expirado: false,
        yaEvaluado: false,
        notfound: true,
      });
    }

    const ticket = rows[0];
    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;
    const expiradoPorTiempo = finalizado && (ahora - finalizado) > (50 * 60 * 1000);
    const expirado = ticket.expirado || expiradoPorTiempo;

    if (expirado && !ticket.expirado) {
      await pool.query("UPDATE tickets SET expirado = 1 WHERE id = ?", [id]);
      return sendSuccess(res, {
        expirado,
        yaEvaluado: ticket.evaluation > 0,
        notfound: false,
      });
    }

    const [evalDetails] = await pool.query(
      `SELECT 
        s.nombre,
        td.ticket_id,
        td.id_servicio
      FROM ticket_detail td 
      JOIN servicios s ON s.id = td.id_servicio
      WHERE td.ticket_id = ?`,
      [id],
    );

    sendSuccess(res, {
      data: evalDetails,
      expirado,
      yaEvaluado: ticket.evaluation > 0,
      notfound: false,
    });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to check evaluation status", error);
  }
}));

/**
 * POST /api/tickets/:id/evaluar
 * Enviar evaluación de un ticket
 */
router.post("/:id/evaluar", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { evaluation, comment } = req.body;

  if (!isValidId(id)) {
    return sendError(res, "VALIDATION_ERROR", "Invalid ticket ID");
  }

  if (!evaluation || !Array.isArray(evaluation)) {
    return sendError(res, "VALIDATION_ERROR", "Evaluation array is required");
  }

  try {
    const [rows] = await pool.query(
      "SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return sendError(res, "NOT_FOUND", "Ticket not found");
    }

    const ticket = rows[0];

    // Check if already evaluated
    if (ticket.evaluation > 0) {
      return sendError(res, "CONFLICT", "Ticket already evaluated");
    }

    // Check expiration
    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;
    const expiradoPorTiempo = finalizado && (ahora - finalizado) > (50 * 60 * 1000);

    if (ticket.expirado || expiradoPorTiempo) {
      if (!ticket.expirado) {
        await pool.query("UPDATE tickets SET expirado = 1 WHERE id = ?", [id]);
      }
      return sendError(res, "EXPIRED", "Ticket evaluation period has expired");
    }

    // Update ticket with comment and mark as expired (to prevent future evaluations)
    await pool.query(
      "UPDATE tickets SET expirado = 1, cli_comment = ? WHERE id = ?",
      [comment || null, id],
    );

    // Get ticket details
    const [data] = await pool.query(
      "SELECT * FROM ticket_detail WHERE ticket_id = ?",
      [id],
    );

    // Insert evaluations
    for (let i = 0; i < evaluation.length; i++) {
      await pool.query(
        `INSERT INTO evaluacion (ticket_id, id_persona, id_user, id_servicio, estrellas)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          data[i]?.id_persona || null,
          data[i]?.id_usuario || null,
          data[i]?.id_servicio || null,
          evaluation[i],
        ],
      );
    }

    sendSuccess(res, { success: true, message: "Evaluation registered successfully" });
  } catch (error) {
    sendError(res, "DATABASE_ERROR", "Failed to register evaluation", error);
  }
}));

module.exports = router;
