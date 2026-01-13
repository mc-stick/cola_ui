const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const {msgtw} = require('./twilio/apiTwi.js');

const app = express();
const PORT = process.env.PORT || 4001;

// Aumentar límite para base64
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/msg', msgtw);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de conexión
pool.getConnection()
  .then(conn => {
    ('✅ Conectado a la base de datos');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err.message);
  });

// ============================================
// RUTAS DE CONFIGURACIÓN
// ============================================
app.get('/api/configuracion', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/configuracion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion } = req.body;
    
    await pool.query(
      'UPDATE configuracion SET nombre_empresa = ?, logo_url = ?, mostrar_imagenes = ?, mostrar_videos = ?, tiempo_rotacion = ? WHERE id = ?',
      [nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion, id]
    );
    
    ('✅ Configuración actualizada');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE MEDIOS
// ============================================
app.get('/api/medios', async (req, res) => {
  try {
    ('📋 Consultando medios activos...');
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipo,
        url,
        nombre,
        activo,
        orden,
        es_local,
        tamano_kb,
        created_at
       FROM medios 
       WHERE activo = TRUE 
       ORDER BY orden, created_at`
    );
    
    (`✅ Medios encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo medios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/medios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        tipo,
        url,
        nombre,
        activo,
        orden,
        es_local,
        tamano_kb,
        created_at
       FROM medios 
       WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Medio no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error obteniendo medio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medios', async (req, res) => {
  try {
    const { tipo, url, nombre, orden, es_local, tamano_kb } = req.body;
    
    if (!tipo || !url || !nombre) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: tipo, url, nombre' 
      });
    }

    if (!['imagen', 'video'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido. Debe ser: imagen o video' 
      });
    }

    const urlLength = url.length;
    const isBase64 = url.startsWith('data:');
    
    ('📥 Recibiendo medio:', {
      tipo,
      nombre,
      es_local: es_local || isBase64,
      tamano_kb: tamano_kb || Math.round(urlLength / 1024),
      url_length: urlLength,
      is_base64: isBase64
    });

    if (isBase64) {
      if (tipo === 'imagen' && !url.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Base64 inválido para imagen' });
      }
      if (tipo === 'video' && !url.startsWith('data:video/')) {
        return res.status(400).json({ error: 'Base64 inválido para video' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO medios 
       (tipo, url, nombre, orden, es_local, tamano_kb) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tipo, 
        url, 
        nombre, 
        orden || 0,
        es_local || isBase64,
        tamano_kb || Math.round(urlLength / 1024)
      ]
    );
    
    ('✅ Medio guardado:', {
      id: result.insertId,
      nombre,
      url_length: urlLength
    });
    
    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'Medio guardado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error guardando medio:', error);
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ 
        error: 'El archivo es demasiado grande para almacenar' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al guardar medio: ' + error.message 
    });
  }
});

app.put('/api/medios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, url, nombre, orden, activo, es_local, tamano_kb } = req.body;
    
    ('📝 Actualizando medio:', id);
    
    await pool.query(
      `UPDATE medios 
       SET tipo = ?, 
           url = ?, 
           nombre = ?, 
           orden = ?, 
           activo = ?,
           es_local = ?,
           tamano_kb = ?
       WHERE id = ?`,
      [tipo, url, nombre, orden, activo, es_local, tamano_kb, id]
    );
    
    ('✅ Medio actualizado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/medios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    ('🗑️  Eliminando medio:', id);
    
    await pool.query(
      'UPDATE medios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    ('✅ Medio eliminado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error eliminando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medios/reorder', async (req, res) => {
  try {
    const { medios } = req.body;
    
    ('🔄 Reordenando medios...');
    
    for (const medio of medios) {
      await pool.query(
        'UPDATE medios SET orden = ? WHERE id = ?',
        [medio.orden, medio.id]
      );
    }
    
    ('✅ Medios reordenados');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error reordenando medios:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE SERVICIOS
// ============================================
app.get('/api/servicios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/servicios', async (req, res) => {
  try {
    const { nombre, descripcion, codigo, color, tiempo_promedio } = req.body;
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, codigo, color, tiempo_promedio) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, codigo, color, tiempo_promedio]
    );
    ('✅ Servicio creado:', result.insertId);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('❌ Error creando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color, tiempo_promedio, activo } = req.body;
    await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, color = ?, tiempo_promedio = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, color, tiempo_promedio, activo, id]
    );
    ('✅ Servicio actualizado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/servicios/:id', async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = FALSE WHERE id = ?', [req.params.id]);
    ('✅ Servicio eliminado:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error eliminando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE PUESTOS
// ============================================
app.get('/api/puestos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM puestos WHERE activo = TRUE ORDER BY numero'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo puestos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/puestos', async (req, res) => {
  try {
    const { numero, nombre } = req.body;
    const [result] = await pool.query(
      'INSERT INTO puestos (numero, nombre) VALUES (?, ?)',
      [numero, nombre]
    );
    ('✅ Puesto creado:', result.insertId);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('❌ Error creando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/puestos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, nombre, activo } = req.body;
    await pool.query(
      'UPDATE puestos SET numero = ?, nombre = ?, activo = ? WHERE id = ?',
      [numero, nombre, activo, id]
    );
    ('✅ Puesto actualizado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE USUARIOS
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      `SELECT u.*, p.numero as puesto_numero, p.nombre as puesto_nombre 
       FROM usuarios u 
       LEFT JOIN puestos p ON u.puesto_id = p.id 
       WHERE u.username = ? AND u.password = ? AND u.activo = TRUE`,
      [username, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const user = rows[0];
    delete user.password;
    
    ('✅ Login exitoso:', {
      usuario: user.nombre,
      rol: user.rol,
      puesto: user.puesto_numero || 'Sin puesto'
    });
    
    res.json({ user, success: true });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.*, p.numero as puesto_numero, p.nombre as puesto_nombre FROM usuarios u LEFT JOIN puestos p ON u.puesto_id = p.id WHERE u.activo = TRUE ORDER BY u.nombre'
    );
    rows.forEach(user => delete user.password);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, username, password, rol, puesto_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, username, password, rol, puesto_id) VALUES (?, ?, ?, ?, ?)',
      [nombre, username, password, rol, puesto_id || null]
    );
    ('✅ Usuario creado:', result.insertId);
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, username, password, rol, puesto_id, activo } = req.body;
    
    let query = 'UPDATE usuarios SET nombre = ?, username = ?, rol = ?, puesto_id = ?, activo = ?';
    let params = [nombre, username, rol, puesto_id || null, activo];
    
    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    ('✅ Usuario actualizado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE OPERADOR-SERVICIOS
// ============================================
app.get('/api/operadores/:usuario_id/servicios', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    ('📋 Consultando servicios del operador:', usuario_id);
    
    const [rows] = await pool.query(
      `SELECT s.*, 
              IF(os.id IS NOT NULL, TRUE, FALSE) as asignado,
              os.id as asignacion_id
       FROM servicios s
       LEFT JOIN operador_servicios os 
         ON s.id = os.servicio_id 
         AND os.usuario_id = ? 
         AND os.activo = TRUE
       WHERE s.activo = TRUE
       ORDER BY s.nombre`,
      [usuario_id]
    );
    
    (`✅ Servicios encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo servicios del operador:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/operadores/:usuario_id/servicios/:servicio_id', async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    ('➕ Asignando servicio:', { usuario_id, servicio_id });
    
    await pool.query(
      `INSERT INTO operador_servicios (usuario_id, servicio_id) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE activo = TRUE`,
      [usuario_id, servicio_id]
    );
    
    ('✅ Servicio asignado');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error asignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/operadores/:usuario_id/servicios/:servicio_id', async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    ('➖ Desasignando servicio:', { usuario_id, servicio_id });
    
    await pool.query(
      'DELETE FROM operador_servicios WHERE usuario_id = ? AND servicio_id = ?',
      [usuario_id, servicio_id]
    );
    
    ('✅ Servicio desasignado');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error desasignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/operadores-servicios', async (req, res) => {
  try {
    ('📋 Consultando operadores con servicios...');
    
    const [operadores] = await pool.query(
      `SELECT DISTINCT
        u.id,
        u.nombre,
        u.username,
        u.puesto_id,
        p.numero as puesto_numero
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       WHERE u.rol = 'operador' AND u.activo = TRUE
       ORDER BY u.nombre`
    );
    
    for (let operador of operadores) {
      const [servicios] = await pool.query(
        `SELECT s.id, s.nombre, s.codigo, s.color
         FROM operador_servicios os
         JOIN servicios s ON os.servicio_id = s.id
         WHERE os.usuario_id = ? AND os.activo = TRUE AND s.activo = TRUE
         ORDER BY s.nombre`,
        [operador.id]
      );
      operador.servicios = servicios;
    }
    
    (`✅ Operadores encontrados: ${operadores.length}`);
    res.json(operadores);
  } catch (error) {
    console.error('❌ Error obteniendo operadores con servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE TICKETS
// ============================================
app.post('/api/tickets', async (req, res) => {
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
    
    ('✅ Ticket creado:', numero);
    
    res.json({ 
      id: insertResult.insertId,
      numero,
      success: true 
    });
  } catch (error) {
    console.error('❌ Error creando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/espera', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vista_tickets WHERE estado = "espera" ORDER BY created_at'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo tickets en espera:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/llamados', async (req, res) => {
  try {
    ('📞 Consultando tickets llamados...');
    
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE estado IN ('llamado', 'en_atencion') 
       ORDER BY llamado_at DESC 
       LIMIT 5`
    );
    
    (`✅ Tickets llamados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo tickets llamados:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/operador/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    ('📋 Consultando tickets del operador:', usuario_id);
    
    const [rows] = await pool.query(
      `SELECT * FROM vista_tickets 
       WHERE usuario_id = ?
       AND estado NOT IN ('atendido', 'no_presentado', 'cancelado') 
       ORDER BY created_at DESC`,
      [usuario_id]
    );
    
    (`✅ Tickets encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo tickets del operador:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/llamar', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, puesto_id } = req.body;
    
    ('📞 Llamando ticket:', { id, usuario_id, puesto_id });
    
    await pool.query(
      'CALL llamar_ticket(?, ?, ?)',
      [id, usuario_id, puesto_id]
    );
    
    ('✅ Ticket llamado');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error llamando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/atender', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;
    
    await pool.query('CALL atender_ticket(?, ?)', [id, usuario_id]);
    ('✅ Ticket en atención');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error atendiendo ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, estado } = req.body;
    
    await pool.query(
      'CALL finalizar_ticket(?, ?, ?)',
      [id, usuario_id, estado]
    );
    
    ('✅ Ticket finalizado:', estado);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error finalizando ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HISTORIAL Y ESTADÍSTICAS
// ============================================
app.get('/api/historial', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, servicio_id } = req.query;
    
    let query = `
      SELECT h.*, t.numero, u.nombre as usuario_nombre, s.nombre as servicio_nombre
      FROM historial h
      LEFT JOIN tickets t ON h.ticket_id = t.id
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(h.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(h.created_at) <= ?';
      params.push(fecha_fin);
    }
    
    if (servicio_id) {
      query += ' AND t.servicio_id = ?';
      params.push(servicio_id);
    }
    
    query += ' ORDER BY h.created_at DESC LIMIT 1000';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// En backend/server.js - REEMPLAZAR el endpoint de historial

app.get('/api/historial', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, servicio_id, estado, limit } = req.query;
    
    let query = `
      SELECT 
        t.id,
        t.numero,
        t.tipo_identificacion,
        t.identificacion,
        t.estado,
        t.llamado_veces,
        t.created_at,
        t.llamado_at,
        t.atendido_at,
        s.nombre as servicio_nombre,
        s.codigo as servicio_codigo,
        s.color as servicio_color,
        u.nombre as operador_nombre,
        p.numero as puesto_numero,
        TIMESTAMPDIFF(MINUTE, t.created_at, t.llamado_at) as tiempo_espera_minutos,
        TIMESTAMPDIFF(MINUTE, t.llamado_at, t.atendido_at) as tiempo_atencion_minutos,
        TIMESTAMPDIFF(MINUTE, t.created_at, t.atendido_at) as tiempo_total_minutos
      FROM tickets t
      LEFT JOIN servicios s ON t.servicio_id = s.id
      LEFT JOIN usuarios u ON t.usuario_id = u.id
      LEFT JOIN puestos p ON t.puesto_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(t.created_at) <= ?';
      params.push(fecha_fin);
    }
    
    if (servicio_id) {
      query += ' AND t.servicio_id = ?';
      params.push(servicio_id);
    }
    
    if (estado) {
      query += ' AND t.estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    } else {
      query += ' LIMIT 500'; // Límite por defecto
    }
    
    console.log('📋 Consultando historial...');
    
    const [rows] = await pool.query(query, params);
    
    console.log(`✅ Historial encontrado: ${rows.length} tickets`);
    
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas', async (req, res) => {
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
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WEBSOCKET
// ============================================
const WebSocket = require('ws');
const server = app.listen(PORT, () => {
  ('');
  ('╔════════════════════════════════════════╗');
  ('║   🎫 SISTEMA DE GESTIÓN DE COLAS      ║');
  ('╚════════════════════════════════════════╝');
  ('');
  (`🌐 Servidor: http://localhost:${PORT}`);
  (`📊 Base de datos: ${process.env.DB_NAME || 'gestion_colas'}`);
  ('');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ('✅ Cliente WebSocket conectado');
  ws.on('close', () => {
    ('❌ Cliente WebSocket desconectado');
  });
});

global.notificarCambio = (tipo, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ tipo, data }));
    }
  });
};

process.on('SIGINT', () => {
  ('\n👋 Cerrando servidor...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});