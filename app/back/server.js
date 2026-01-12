const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_colas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// RUTAS DE CONFIGURACIÓN
app.get('/api/configuracion', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
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
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE MEDIOS - ACTUALIZADO
// ============================================

// Obtener medios activos
app.get('/api/medios', async (req, res) => {
  try {
    console.log('📋 Consultando medios activos...');
    
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
    
    console.log(`✅ Medios encontrados: ${rows.length}`);
    
    res.json(rows);
  } catch (error) {
    console.error('❌ Error obteniendo medios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo medio
app.post('/api/medios', async (req, res) => {
  try {
    const { tipo, url, nombre, orden, es_local, tamano_kb } = req.body;
    
    // Validaciones
    if (!tipo || !url || !nombre) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: tipo, url, nombre' 
      });
    }

    // Validar tipo
    if (!['imagen', 'video'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido. Debe ser: imagen o video' 
      });
    }

    // Log para debug
    const urlLength = url.length;
    const urlPreview = url.substring(0, 100);
    const isBase64 = url.startsWith('data:');
    
    console.log('📥 Recibiendo medio:', {
      tipo,
      nombre,
      es_local: es_local || false,
      tamano_kb: tamano_kb || 0,
      url_length: urlLength,
      is_base64: isBase64,
      url_preview: urlPreview + '...'
    });

    // Validar URL
    if (isBase64) {
      // Es base64 - validar formato
      if (tipo === 'imagen' && !url.startsWith('data:image/')) {
        return res.status(400).json({ 
          error: 'Base64 inválido para imagen' 
        });
      }
      if (tipo === 'video' && !url.startsWith('data:video/')) {
        return res.status(400).json({ 
          error: 'Base64 inválido para video' 
        });
      }
    } else {
      // Es URL - validar formato básico
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ 
          error: 'URL inválida' 
        });
      }
    }

    // Insertar en la base de datos
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
    
    console.log('✅ Medio guardado:', {
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
    
    // Error específico de MySQL
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

// Actualizar medio
app.put('/api/medios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, url, nombre, orden, activo, es_local, tamano_kb } = req.body;
    
    console.log('📝 Actualizando medio:', id);
    
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
    
    console.log('✅ Medio actualizado:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar medio (soft delete)
app.delete('/api/medios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️  Eliminando medio:', id);
    
    // Soft delete - solo desactivar
    await pool.query(
      'UPDATE medios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    // O hard delete si prefieres:
    // await pool.query('DELETE FROM medios WHERE id = ?', [id]);
    
    console.log('✅ Medio eliminado:', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error eliminando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener información de un medio específico
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

// Endpoint para reordenar medios
app.post('/api/medios/reorder', async (req, res) => {
  try {
    const { medios } = req.body; // Array de {id, orden}
    
    console.log('🔄 Reordenando medios...');
    
    // Actualizar el orden de cada medio
    for (const medio of medios) {
      await pool.query(
        'UPDATE medios SET orden = ? WHERE id = ?',
        [medio.orden, medio.id]
      );
    }
    
    console.log('✅ Medios reordenados');
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error reordenando medios:', error);
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE SERVICIOS
app.get('/api/servicios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM servicios WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
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
    res.json({ id: result.insertId, success: true });
  } catch (error) {
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/servicios/:id', async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE PUESTOS
app.get('/api/puestos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM puestos WHERE activo = TRUE ORDER BY numero'
    );
    res.json(rows);
  } catch (error) {
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
    res.json({ id: result.insertId, success: true });
  } catch (error) {
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE USUARIOS
// Login - CORREGIDO
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
    
    console.log('✅ Login exitoso:', {
      usuario: user.nombre,
      rol: user.rol,
      puesto: user.puesto_numero || 'Sin puesto'
    });
    
    res.json({ user, success: true });
  } catch (error) {
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
    res.json({ id: result.insertId, success: true });
  } catch (error) {
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE TICKETS
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
    
    res.json({ 
      id: insertResult.insertId,
      numero,
      success: true 
    });
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/llamados', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vista_tickets WHERE estado IN ("llamado", "en_atencion") ORDER BY llamado_at DESC LIMIT 5'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// En server.js - Este endpoint debe estar así
app.get('/api/tickets/operador/:usuario_id', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    console.log('📋 Consultando tickets del operador ID:', usuario_id);
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        numero,
        servicio_id,
        tipo_identificacion,
        identificacion,
        estado,
        usuario_id,
        puesto_id,
        llamado_veces,
        created_at,
        llamado_at,
        servicio_nombre,
        servicio_codigo,
        servicio_color,
        puesto_numero,
        puesto_nombre,
        operador_nombre
       FROM vista_tickets 
       WHERE usuario_id = ?
       AND estado NOT IN ('atendido', 'no_presentado', 'cancelado') 
       ORDER BY created_at DESC`,
      [usuario_id]
    );
    
    console.log(`📋 Tickets encontrados para operador ${usuario_id}:`, rows.length);
    if (rows.length > 0) {
      rows.forEach(t => {
        console.log(`   🎫 ${t.numero} - Estado: ${t.estado} - Servicio: ${t.servicio_nombre}`);
      });
    }
    
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
    
    await pool.query(
      'CALL llamar_ticket(?, ?, ?)',
      [id, usuario_id, puesto_id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/atender', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;
    
    await pool.query('CALL atender_ticket(?, ?)', [id, usuario_id]);
    res.json({ success: true });
  } catch (error) {
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
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE HISTORIAL Y ESTADÍSTICAS
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
    res.status(500).json({ error: error.message });
  }
});

// WEBSOCKET
const WebSocket = require('ws');
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🎫 SISTEMA DE GESTIÓN DE COLAS      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME || 'gestion_colas'}`);
  console.log('');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('✅ Cliente WebSocket conectado');
  ws.on('close', () => {
    console.log('❌ Cliente WebSocket desconectado');
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
  console.log('\n👋 Cerrando servidor...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});