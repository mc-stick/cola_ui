const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/usuarios
 * Obtener todos los usuarios activos
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.*, p.numero as puesto_numero, p.nombre as puesto_nombre FROM usuarios u LEFT JOIN puestos p ON u.puesto_id = p.id WHERE u.activo = TRUE ORDER BY u.nombre'
    );
    rows.forEach(user => delete user.password);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * GET /api/usuarios/:user
 * Obtener teléfono de un usuario específico
 */
router.get('/:user', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT tel FROM usuarios WHERE activo = TRUE AND username=?',
      [req.params.user]
    );

    const usuario = rows[0];
    res.json(usuario);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/usuarios
 * Crear un nuevo usuario
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, username, password, rol, puesto_id, tel } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, username, password, rol, puesto_id, tel) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, username, hashedPassword, rol, puesto_id || null, tel]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR USUARIO',
      modulo: 'Usuarios',
      detalles: `Usuario: ${username}, Rol: ${rol}, ID: ${result.insertId}`,
      req
    });
    
    res.json({ id: result.insertId, success: true });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/usuarios/:user/change
 * Cambiar contraseña de un usuario
 */
router.put('/:user/change', authenticateToken, async (req, res) => {
  try {
    const { user } = req.params;
    const { password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await pool.query(
      'UPDATE usuarios SET password = ? WHERE username = ?',
      [hashedPassword, user]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CAMBIAR CONTRASEÑA',
      modulo: 'Usuarios',
      detalles: `Usuario: ${user}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/usuarios/:id
 * Actualizar un usuario completo
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, username, password, rol, puesto_id, activo, tel } = req.body;

    const saltRounds = 10;
    
    let query = 'UPDATE usuarios SET nombre = ?, username = ?, rol = ?, puesto_id = ?, activo = ?, tel=?';
    let params = [nombre, username, rol, puesto_id || null, activo, tel];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR USUARIO',
      modulo: 'Usuarios',
      detalles: `ID: ${id}, Usuario: ${username}, Rol: ${rol}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/usuarios/:id/operator
 * Actualizar datos específicos de operador (contraseña y teléfono)
 */
router.put('/:id/operator', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { pass, tel } = req.body;
    const updates = [];
    const params = [];

    if (pass) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(pass, saltRounds);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (tel) {
      updates.push('tel = ?');
      params.push(tel);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR DATOS OPERADOR',
      modulo: 'Usuarios',
      detalles: `ID: ${id}, Campos: ${updates.join(', ')}`,
      req
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/usuarios/:id
 * Desactivar un usuario (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const [rows] = await pool.query(
      'SELECT id, rol, activo, username FROM usuarios WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    if (usuario.rol === 'admin' && usuario.activo) {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = "admin" AND activo = 1 and user_active=1'
      );

      if (admins[0].total <= 1) {
        return res.status(400).json({
          error: 'No se puede eliminar el último administrador activo'
        });
      }
    }

    await pool.query(
      'UPDATE usuarios SET activo = 0 WHERE id = ?',
      [userId]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR USUARIO',
      modulo: 'Usuarios',
      detalles: `ID: ${userId}, Usuario: ${usuario.username}`,
      req
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/usuarios/:id/switch
 * Alternar el estado activo/inactivo de un usuario
 */
router.delete('/:id/switch', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, rol, activo, user_active, username FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'usuario no encontrado' });
    }

    const usuario = rows[0];
    const nuevoValor = !rows[0].user_active;

    if (usuario.rol === 'admin' && usuario.activo) {
      const [admins] = await pool.query(
        'SELECT COUNT(*) AS total FROM usuarios WHERE rol = "admin" AND activo = 1 AND user_active=1'
      );

      if (admins[0].total <= 1 && nuevoValor === false) {
        return res.status(400).json({
          error: 'No se puede deshabilitar el último administrador activo'
        });
      }
    }
    
    await pool.query(
      'UPDATE usuarios SET user_active = ? WHERE id = ?',
      [nuevoValor, req.params.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 'ACTIVAR USUARIO' : 'DESACTIVAR USUARIO',
      modulo: 'Usuarios',
      detalles: `ID: ${req.params.id}, Usuario: ${usuario.username}`,
      req
    });

    res.json({ success: true, activo: nuevoValor });
  } catch (error) {
    console.error('Error modificando usuario:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

module.exports = router;