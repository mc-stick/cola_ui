const express = require('express');
const { pool } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/departamento
 * Obtener todos los departamento activos
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM departamento'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo departamento:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * POST /api/departamento
 * Crear un nuevo servicio
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre} = req.body;
   
    const [result] = await pool.query(
      'INSERT INTO departamento (nombre) VALUES (?)',
      [nombre]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR DEPARTAMENTO',
      modulo: 'Departamento',
      detalles: `Nombre: ${nombre}`,
      req
    });
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Error creando dep:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * PUT /api/departamento/:id
 * Actualizar un servicio existente
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
 
    const { id } = req.params;
    const { nombre } = req.body;
   console.log("uptade departamento",id,nombre)
    const [rows] = await pool.query(
      'SELECT * FROM departamento WHERE id = ?',
      [id]
    );
    const anterior = rows[0].nombre;
    
    await pool.query(
      'UPDATE departamento SET nombre = ? WHERE id = ?',
      [nombre, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR Departamento ID: ${id}`,
      modulo: 'departamento',
      detalles: ` Cambió "${anterior}" por "${nombre}"`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando departamento:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/departamento/:id
 * Desactivar un servicio (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {

     const [rows] = await pool.query(
      'SELECT * FROM departamento WHERE id = ?',
      [req.params.id]
    );
    const anterior = rows[0].nombre;
    await pool.query('Delete from departamento WHERE id = ?', Number([req.params.id]));
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR Departamento',
      modulo: 'departamento',
      detalles: `ID: ${req.params.id}, Nombre : ${anterior}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando Departamento:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

/**
 * DELETE /api/departamento/:id/switch
 * Alternar el estado activo/inactivo de un servicio
 */
// router.delete('/:id/switch', authenticateToken, async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       'SELECT service_active FROM departamento WHERE id = ?',
//       [req.params.id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Servicio no encontrado' });
//     }

//     const nuevoValor = !rows[0].service_active;

//     await pool.query(
//       'UPDATE departamento SET service_active = ? WHERE id = ?',
//       [nuevoValor, req.params.id]
//     );

//     await registrarAuditoria({
//       usuarioId: req.user.id,
//       accion: nuevoValor ? 'ACTIVAR SERVICIO' : 'DESACTIVAR SERVICIO',
//       modulo: 'departamento',
//       detalles: `ID: ${req.params.id}`,
//       req
//     });

//     res.json({ success: true, service_active: nuevoValor });
//   } catch (error) {
//     console.error('Error modificando servicio:', error);
//     res.status(500).json({ error: "error del servidor"});
//   }
// });

module.exports = router;