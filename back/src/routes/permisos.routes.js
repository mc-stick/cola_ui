const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/usuarios/permisos/todos
 * Obtener todos los administradores con sus permisos
 */
router.get('/permisos/todos', async (req, res) => {
  try {
    const [admins] = await pool.query(`
      SELECT DISTINCT
        u.id, u.nombre, u.username, u.rol, u.user_active, u.activo
      FROM usuarios u
      WHERE u.rol = 'admin' AND u.activo = TRUE
      ORDER BY u.nombre
    `);

    for (const admin of admins) {
      const [permisos] = await pool.query(
        `SELECT p.id, p.nombre
        FROM usuarios_permisos up
        INNER JOIN permisos p ON p.id = up.permiso_id
        WHERE up.usuario_id = ? AND up.activo = TRUE
        ORDER BY p.nombre`,
        [admin.id]
      );
      admin.permisos = permisos;
    }

    res.json(admins);

  } catch (error) {
    console.error('Error obteniendo admins con permisos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/usuarios/:id/permisos
 * Obtener permisos de un usuario específico
 */
router.get('/:id/permisos', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT p.id
      FROM permisos p
      INNER JOIN usuarios_permisos up ON up.permiso_id = p.id
      WHERE up.usuario_id = ? AND up.activo = 1
    `, [id]);

    res.json(rows.map(r => r.id));
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/usuarios/permisos
 * Asignar un permiso a un usuario
 */
router.post('/permisos', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, permiso_id } = req.body;

    const [result] = await pool.query(`
      INSERT INTO usuarios_permisos (usuario_id, permiso_id, activo)
      VALUES (?, ?, 1)
    `, [usuario_id, permiso_id]);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuario_id}, Permiso ID: ${permiso_id}`,
      req
    });

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      permiso_id,
      activo: 1
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Permiso ya asignado al usuario' });
    }

    console.error('Error asignando permiso:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/usuarios/:usuarioId/permisos/:permisoId
 * Actualizar el estado de un permiso de usuario
 */
router.put('/:usuarioId/permisos/:permisoId', authenticateToken, async (req, res) => {
  try {
    const { usuarioId, permisoId } = req.params;
    const { activo } = req.body;

    const [rows] = await pool.query(
      `SELECT 1 FROM usuarios_permisos
       WHERE usuario_id = ? AND permiso_id = ?`,
      [usuarioId, permisoId]
    );

    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO usuarios_permisos (usuario_id, permiso_id, activo)
         VALUES (?, ?, 1)`,
        [usuarioId, permisoId]
      );

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'CREAR Y ACTIVAR PERMISO',
        modulo: 'Permisos',
        detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`,
        req
      });

      return res.json({ message: 'Permiso creado y activado' });
    }

    await pool.query(
      `UPDATE usuarios_permisos
       SET activo = ?
       WHERE usuario_id = ? AND permiso_id = ?`,
      [activo, usuarioId, permisoId]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: activo ? 'ACTIVAR PERMISO' : 'DESACTIVAR PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`,
      req
    });

    res.json({ message: 'Permiso actualizado' });

  } catch (error) {
    console.error('Error gestionando permiso:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/usuarios/:usuarioId/permisos/:permisoId
 * Remover un permiso de un usuario
 */
router.delete('/:usuarioId/permisos/:permisoId', authenticateToken, async (req, res) => {
  try {
    const { usuarioId, permisoId } = req.params;

    const [result] = await pool.query(`
      UPDATE usuarios_permisos
      SET activo = 0
      WHERE usuario_id = ? AND permiso_id = ?
    `, [usuarioId, permisoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'REMOVER PERMISO',
      modulo: 'Permisos',
      detalles: `Usuario ID: ${usuarioId}, Permiso ID: ${permisoId}`,
      req
    });

    res.json({ message: 'Permiso removido del usuario' });
  } catch (error) {
    console.error('Error removiendo permiso:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;