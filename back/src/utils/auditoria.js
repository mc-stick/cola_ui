const { pool } = require('../config/database');

/**
 * Registra una acción en el sistema de auditoría
 * @param {Object} params - Parámetros de auditoría
 * @param {number} params.usuarioId - ID del usuario que ejecuta la acción
 * @param {string} params.accion - Descripción de la acción realizada
 * @param {string} params.modulo - Módulo del sistema donde ocurre la acción
 * @param {string} params.detalles - Detalles adicionales de la acción
 * @param {Object} params.req - Objeto request de Express para obtener IP y user-agent
 */
async function registrarAuditoria({ usuarioId, accion, modulo, detalles }) {

  
  try {
    await pool.query(
      `INSERT INTO auditoria 
       (usuario_id, accion_id, modulo, detalles)
       VALUES (?, ?, ?, ?)`,
      [
        usuarioId,
        accion,
        modulo,
        detalles || null,
      ]
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error.message);
  }
}

module.exports = { registrarAuditoria };