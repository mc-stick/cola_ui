const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const {msgtw} = require('./twilio/apiTwi.js');

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET;


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

    conn.release();
  })
  .catch(err => {

  });

// ============================================
// FUNCIÓN DE AUDITORÍA
// ============================================
async function registrarAuditoria({ usuarioId, accion, modulo, detalles, req }) {
  
  const fecha = new Date();
  const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
  const horaStr = fecha.toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    await pool.query(
      `INSERT INTO auditoria 
       (usuario_id, accion, modulo, detalle, fecha, hora, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        accion,
        modulo,
        detalles || null,
        fechaStr,
        horaStr,
        req?.ip || null,
        req?.headers['user-agent'] || null
      ]
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error.message);
  }
}

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET || 'tu_secreto_jwt', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE username = ? AND activo = TRUE AND user_active = TRUE',
      [username]
    );

    if (rows.length === 0) {
      await registrarAuditoria({
        usuarioId: null,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: `Usuario: ${username}`,
        req
      });
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await registrarAuditoria({
        usuarioId: user.id,
        accion: 'LOGIN FALLIDO',
        modulo: 'Autenticación',
        detalles: `Contraseña incorrecta para ${user.nombre}`,
        req
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    delete user.password; 

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' } 
    );

    await registrarAuditoria({
      usuarioId: user.id,
      accion: 'LOGIN EXITOSO',
      modulo: 'Autenticación',
      detalles: `Usuario "${user.nombre}" con privilegios "${user.rol}" inicia sesion`,
      req
    });

    res.json({ user, token, success: true });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT u.id, u.nombre, u.username, u.rol, u.puesto_id, u.tel,
              p.nombre as puesto_nombre, p.numero as puesto_numero 
       FROM usuarios u
       LEFT JOIN puestos p ON u.puesto_id = p.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE CONFIGURACIÓN
// ============================================
app.get('/api/configuracion', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/configuracion/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion } = req.body;
    
    await pool.query(
      'UPDATE configuracion SET nombre_empresa = ?, logo_url = ?, mostrar_imagenes = ?, mostrar_videos = ?, tiempo_rotacion = ? WHERE id = ?',
      [nombre_empresa, logo_url, mostrar_imagenes, mostrar_videos, tiempo_rotacion, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR CONFIGURACIÓN',
      modulo: 'Configuración',
      detalles: `Empresa: ${nombre_empresa}`,
      req
    });
    
   
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE MEDIOS
// ============================================
app.get('/api/medios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, tipo, url, nombre, activo, medio_active, orden, es_local, tamano_kb, created_at
       FROM medios 
       WHERE activo = TRUE 
       ORDER BY orden, created_at`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo medios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medios', authenticateToken, async (req, res) => {
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
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR MEDIO',
      modulo: 'Medios',
      detalles: `Tipo: ${tipo}, Nombre: ${nombre}, ID: ${result.insertId}`,
      req
    });
    
    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'Medio guardado correctamente'
    });
    
  } catch (error) {
    console.error('Error guardando medio:', error);
    
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

app.put('/api/medios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, url, nombre, orden, activo, es_local, tamano_kb } = req.body;
    
    await pool.query(
      `UPDATE medios 
       SET tipo = ?, url = ?, nombre = ?, orden = ?, activo = ?, es_local = ?, tamano_kb = ?
       WHERE id = ?`,
      [tipo, url, nombre, orden, activo, es_local, tamano_kb, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}, Nombre: ${nombre}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/medios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE medios SET activo = FALSE WHERE id = ?',
      [id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR MEDIO',
      modulo: 'Medios',
      detalles: `ID: ${id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando medio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/medios/:id/switch', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT medio_active,tipo, nombre  FROM medios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'medio no encontrado' });
    }

    const nuevoValor = !rows[0].medio_active;
    const tipo = rows[0].tipo;
    const nombre = rows[0].nombre;

    await pool.query(
      'UPDATE medios SET medio_active = ? WHERE id = ?',
      [nuevoValor, req.params.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? `ACTIVAR MEDIO` : `DESACTIVAR MEDIO`,
      modulo: 'Medios',
      detalles: nuevoValor ? `Activó ${tipo} ${nombre} en pantalla` : `Desactivó ${tipo} ${nombre} en pantalla`,
      req
    });

    res.json({ success: true, medio_active: nuevoValor });
  } catch (error) {
    console.error('Error modificando medio:', error);
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
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/servicios', authenticateToken, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, color, tiempo_promedio } = req.body;
   
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, codigo, color, tiempo_promedio) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, codigo, color, tiempo_promedio]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR SERVICIO',
      modulo: 'Servicios',
      detalles: `Nombre: ${nombre}, Código: ${codigo}, ID: ${result.insertId}`,
      req
    });
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/servicios/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color, tiempo_promedio, activo } = req.body;

    const [rows] = await pool.query(
      'Select * from servicios WHERE id = ?',
      [id]
    );
    const anterior = rows[0].nombre;

  
    
    await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, color = ?, tiempo_promedio = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, color, tiempo_promedio, activo, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: `ACTUALIZAR SERVICIO ID: ${id}`,
      modulo: 'Servicios',
      detalles: ` Cambió "${anterior}" por "${nombre}"`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(' Error actualizando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/servicios/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = FALSE WHERE id = ?', [req.params.id]);
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ELIMINAR SERVICIO',
      modulo: 'Servicios',
      detalles: `ID: ${req.params.id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/servicios/:id/switch', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT service_active FROM servicios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const nuevoValor = !rows[0].service_active;

    await pool.query(
      'UPDATE servicios SET service_active = ? WHERE id = ?',
      [nuevoValor, req.params.id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 'ACTIVAR SERVICIO' : 'DESACTIVAR SERVICIO',
      modulo: 'Servicios',
      detalles: `ID: ${req.params.id}`,
      req
    });

    res.json({ success: true, service_active: nuevoValor });
  } catch (error) {
    console.error('Error modificando servicio:', error);
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
    console.error('Error obteniendo puestos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/puestos', authenticateToken, async (req, res) => {
  try {
    const { numero, nombre } = req.body;

    const numeroStr = numero != null ? numero.toString().trim() : '';
    const nombreStr = nombre != null ? nombre.toString().trim() : '';

    if (!numeroStr || !nombreStr) {
      return res.status(400).json({
        error: 'Número o nombre no pueden estar vacíos'
      });
    }

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE numero = ? OR nombre = ?',
      [numeroStr, nombreStr]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un puesto con el mismo número o nombre'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO puestos (numero, nombre) VALUES (?, ?)',
      [numeroStr, nombreStr]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'CREAR PUESTO',
      modulo: 'Puestos',
      detalles: `Número: ${numeroStr}, Nombre: ${nombreStr}, ID: ${result.insertId}`,
      req
    });

    res.json({ id: result.insertId, success: true });

  } catch (error) {
    console.error('Error creando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/puestos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, nombre, activo } = req.body;

    const [existentes] = await pool.query(
      'SELECT * FROM puestos WHERE (numero = ? OR nombre = ?) AND id != ?',
      [numero, nombre, id]
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        error: 'Ya existe otro puesto con el mismo número o nombre'
      });
    }

    await pool.query(
      'UPDATE puestos SET numero = ?, nombre = ?, activo = ? WHERE id = ?',
      [numero, nombre, activo, id]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ACTUALIZAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${id}, Número: ${numero}, Nombre: ${nombre}`,
      req
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error actualizando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/puestos/:id/switch', authenticateToken, async (req, res) => {
  try {
    const puestoId = req.params.id;
    const [rows] = await pool.query(
      'SELECT puesto_active FROM puestos WHERE id = ?',
      [puestoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Puesto no encontrado' });
    }

    const [usuariosAsignados] = await pool.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE puesto_id = ?',
      [puestoId]
    );

    if (usuariosAsignados[0].total > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar el puesto porque tiene usuarios asignados'
      });
    }

    const nuevoValor = !rows[0].puesto_active;
    const name = rows[0].nombre;

    await pool.query(
      'UPDATE puestos SET puesto_active = ? WHERE id = ?',
      [nuevoValor, puestoId]
    );

    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: nuevoValor ? 'ACTIVAR PUESTO' : 'DESACTIVAR PUESTO',
      modulo: 'Puestos',
      detalles: `ID: ${puestoId}, NOMBRE: ${name}`,
      req
    });

    res.json({ success: true, puesto_active: nuevoValor });

  } catch (error) {
    console.error('Error modificando puesto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE USUARIOS
// ============================================
app.get('/api/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.*, p.numero as puesto_numero, p.nombre as puesto_nombre FROM usuarios u LEFT JOIN puestos p ON u.puesto_id = p.id WHERE u.activo = TRUE ORDER BY u.nombre'
    );
    rows.forEach(user => delete user.password);
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/usuarios/:user', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT tel FROM usuarios WHERE activo = TRUE AND username=?',
      [req.params.user]
    );

    const usuario = rows[0];
    res.json(usuario);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/usuarios/:user/change', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id/operator', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/usuarios/:id', authenticateToken, async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/usuarios/:id/switch', authenticateToken, async (req, res) => {
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

      if (admins[0].total <= 1 && nuevoValor===false) {
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
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE PERMISOS
// ============================================
app.get('/api/usuarios/permisos/todos', async (req, res) => {
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

app.get('/api/usuarios/:id/permisos', async (req, res) => {
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

app.post('/api/usuarios/permisos', authenticateToken, async (req, res) => {
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

app.put('/api/usuarios/:usuarioId/permisos/:permisoId', authenticateToken, async (req, res) => {
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

app.delete('/api/usuarios/:usuarioId/permisos/:permisoId', authenticateToken, async (req, res) => {
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

// ============================================
// RUTAS DE OPERADOR-SERVICIOS
// ============================================
app.get('/api/operadores/:usuario_id/servicios', async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
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
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo servicios del operador:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    await pool.query(
      `INSERT INTO operador_servicios (usuario_id, servicio_id) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE activo = TRUE`,
      [usuario_id, servicio_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'ASIGNAR SERVICIO A OPERADOR',
      modulo: 'Operadores-Servicios',
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error asignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/operadores/:usuario_id/servicios/:servicio_id', authenticateToken, async (req, res) => {
  try {
    const { usuario_id, servicio_id } = req.params;
    
    await pool.query(
      'DELETE FROM operador_servicios WHERE usuario_id = ? AND servicio_id = ?',
      [usuario_id, servicio_id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'DESASIGNAR SERVICIO DE OPERADOR',
      modulo: 'Operadores-Servicios',
      detalles: `Operador ID: ${usuario_id}, Servicio ID: ${servicio_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error desasignando servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/operadores-servicios', async (req, res) => {
  try {    
    const [operadores] = await pool.query(
      `SELECT DISTINCT
        u.id, u.nombre, u.username, u.puesto_id, u.user_active,
        p.numero as puesto_numero, p.nombre as puesto_nombre
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
    
    res.json(operadores);
  } catch (error) {
    console.error('Error obteniendo operadores con servicios:', error);
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

app.get('/api/tickets/espera', async (req, res) => {
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

app.get('/api/tickets/llamados', async (req, res) => {
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

app.get('/api/tickets/operador/:usuario_id', async (req, res) => {
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

app.post('/api/tickets/:id/llamar', authenticateToken, async (req, res) => {
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

app.post('/api/tickets/:id/atender', authenticateToken, async (req, res) => {
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

app.post('/api/tickets/:id/finalizar', authenticateToken, async (req, res) => {
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

app.post('/api/tickets/:id/transferir', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { servicio_id, comentario } = req.body;
    
    await pool.query(
      'UPDATE tickets SET servicio_id=?, notes=?, estado="espera", puesto_id=null, usuario_id=null, transferido=1 where id=? ',
      [servicio_id, comentario, id]
    );
    
    await registrarAuditoria({
      usuarioId: req.user.id,
      accion: 'TRANSFERIR TICKET',
      modulo: 'Tickets',
      detalles: `Ticket ID: ${id}, Nuevo Servicio ID: ${servicio_id}`,
      req
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error transfiriendo ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

//evaluar:

// GET: estado de evaluación de un ticket
app.get('/api/tickets/:id/estado-evaluacion', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id=? AND estado="atendido" ', //created_at por id
      [id]
    );
    const ticket = rows[0];
     if (!ticket) return res.json({ success: true, expirado:false, yaEvaluado:false, notfound:true });
    // if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 30 * 60 * 1000);
    const expirado = ticket.expirado || expiradoPorTiempo;

    if (expirado && !ticket.expirado) {
      await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]); //created_at por id cambiar
    }

    res.json({
      success: true,
      expirado,
      yaEvaluado: ticket.evaluation > 0,
      notfound:false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// POST: enviar evaluación
app.post('/api/tickets/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluation } = req.body;

    const [rows] = await pool.query(
      'SELECT finalizado_at, expirado, evaluation FROM tickets WHERE id=?', //created_at por id cambiar
      [id]
    );
    const ticket = rows[0];
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket no encontrado" });

    const ahora = new Date();
    const finalizado = ticket.finalizado_at ? new Date(ticket.finalizado_at) : null;

    const expiradoPorTiempo = finalizado && (ahora - finalizado > 30 * 60 * 1000);
    if (ticket.expirado || expiradoPorTiempo) {
      if (!ticket.expirado) {
        await pool.query('UPDATE tickets SET expirado=1 WHERE id=?', [id]); //created_at por id cambiar
      }
      return res.status(400).json({ success: false, message: "Ticket expirado" });
    }

    if (ticket.evaluation > 0) {
      return res.status(400).json({ success: false, message: "Ticket ya evaluado" });
    }

    await pool.query('UPDATE tickets SET evaluation=?, expirado=1 WHERE id=?', [evaluation, id]); //created_at por id cambiar

    res.json({ success: true, message: "Evaluación registrada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});


// ============================================
// HISTORIAL Y ESTADÍSTICAS
// ============================================
app.get('/api/historial', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, servicio_id, estado, operador } = req.query;
   
    let query = `
      SELECT h.*,t.finalizado_at, t.numero, u.nombre as usuario_nombre, s.nombre as servicio_nombre, t.transferido
      FROM historial h
      LEFT JOIN tickets t ON h.ticket_id = t.id
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      LEFT JOIN servicios s ON t.servicio_id = s.id
      WHERE 1=1 AND s.service_active = 1
    `;
    
    const params = [];
    
    if (fecha_inicio) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ' AND DATE(t.finalizado_at) <= ?';
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

    if (operador) {
      query += ' AND t.usuario_id = ?';
      params.push(operador);
    }
    
    query += ' ORDER BY h.created_at DESC LIMIT 1000';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(' Error obteniendo historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// ESTADÍSTICAS
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
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/auditoria', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, usuario_id } = req.query;
    
    let query = `
      SELECT *
      FROM view_auditoria
      WHERE 1 = 1
    `;
    const params = [];

    if (fecha_inicio) {
      query += ' AND fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND fecha <= ?';
      params.push(fecha_fin);
    }

    if (usuario_id) {
      query += ' AND usuario_id = ?';
      params.push(usuario_id);
    }

    query += ' ORDER BY auditoria_id DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(' Error obteniendo auditoría:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/estadisticas/rango', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
     
    const query = `
      SELECT 
        DATE(t.created_at) as fecha,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados,
        SUM(CASE WHEN estado = 'espera' THEN 1 ELSE 0 END) as en_espera,
        SUM(CASE WHEN estado IN ('llamado', 'en_atencion') THEN 1 ELSE 0 END) as en_proceso,
        AVG(CASE 
          WHEN estado = 'atendido' AND atendido_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, atendido_at)
          ELSE NULL 
        END) as tiempo_promedio_servicio
      FROM tickets t
      LEFT JOIN servicios s ON s.id = t.servicio_id AND s.service_active = 1
      WHERE DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY DATE(t.created_at)
      ORDER BY fecha ASC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por rango:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas/servicios', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        s.id, s.nombre, s.codigo, s.color, s.service_active,
        COALESCE(COUNT(t.id), 0) AS total_tickets,
        COALESCE(SUM(CASE WHEN t.estado = 'atendido' THEN 1 END), 0) AS atendidos,
        COALESCE(SUM(CASE WHEN t.estado = 'no_presentado' THEN 1 END), 0) AS no_presentados,
        COALESCE(
          AVG(
            CASE 
              WHEN t.estado = 'atendido'
               AND t.llamado_at IS NOT NULL
               AND t.finalizado_at IS NOT NULL
               AND t.finalizado_at > t.llamado_at
              THEN TIMESTAMPDIFF(MINUTE, t.llamado_at, t.finalizado_at)
            END
          ), 0
        ) AS tiempo_promedio_servicio
      FROM servicios s
      LEFT JOIN tickets t 
        ON s.id = t.servicio_id
        AND t.created_at BETWEEN ? AND ?
      WHERE s.activo = TRUE
      GROUP BY s.id, s.nombre, s.codigo, s.color
      ORDER BY total_tickets DESC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por servicio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas/operadores', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
        
    const query = `
      SELECT 
        u.id, u.nombre, p.numero AS puesto_numero,
        COALESCE(COUNT(t.id), 0) AS total_tickets,
        COALESCE(SUM(CASE WHEN t.estado = 'atendido' THEN 1 END), 0) AS atendidos,
        COALESCE(SUM(CASE WHEN t.estado = 'no_presentado' THEN 1 END), 0) AS no_presentados,
        AVG(
          CASE 
            WHEN t.estado = 'atendido'
            AND t.llamado_at IS NOT NULL
            AND t.finalizado_at IS NOT NULL
            AND t.finalizado_at > t.llamado_at
            THEN TIMESTAMPDIFF(MINUTE, t.llamado_at, t.finalizado_at)
          END
        ) AS tiempo_promedio_servicio
      FROM usuarios u
      LEFT JOIN puestos p ON u.puesto_id = p.id
      LEFT JOIN tickets t 
        ON u.id = t.usuario_id
        AND DATE(t.created_at) >= ?
        AND DATE(t.finalizado_at) <= ?
      WHERE u.rol = 'operador' AND u.activo = TRUE
      GROUP BY u.id, u.nombre, p.numero
      ORDER BY total_tickets DESC
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por operador:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas/horas', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
        
    const query = `
      SELECT 
        HOUR(created_at) as hora,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados
      FROM tickets
      WHERE DATE(created_at) = ?
      GROUP BY HOUR(created_at)
      ORDER BY hora
    `;
    
    const [rows] = await pool.query(query, [fechaConsulta]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo estadísticas por hora:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/estadisticas/resumen', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    const inicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fecha_fin || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN estado = 'atendido' THEN 1 ELSE 0 END) as atendidos,
        SUM(CASE WHEN estado = 'no_presentado' THEN 1 ELSE 0 END) as no_presentados,
        SUM(CASE WHEN estado = 'espera' THEN 1 ELSE 0 END) as en_espera,
        SUM(CASE WHEN transferido = 1 THEN 1 ELSE 0 END) as transferido,
        SUM(CASE WHEN estado IN ('llamado', 'en_atencion') THEN 1 ELSE 0 END) as en_proceso,
        AVG(CASE 
          WHEN estado = 'atendido' AND finalizado_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, llamado_at, finalizado_at)
          ELSE 0 
        END) as tiempo_promedio_servicio,
        AVG(CASE 
          WHEN estado = 'atendido' AND llamado_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, created_at, llamado_at)
          ELSE 0 
        END) as tiempo_promedio_espera,
        MIN(created_at) as primer_ticket,
        MAX(created_at) as ultimo_ticket
      FROM tickets
    `;
    
    const [rows] = await pool.query(query, [inicio, fin]);
        
    res.json(rows[0] || {
      total_tickets: 0,
      atendidos: 0,
      no_presentados: 0,
      en_espera: 0,
      en_proceso: 0,
      tiempo_promedio_servicio: 0,
      transferidos: null,
      primer_ticket: null,
      ultimo_ticket: null
    });

  } catch (error) {
    console.error('Error obteniendo resumen general:', error);
    res.status(500).json({ error: error.message });
  }
});


// ============================================
// WEBSOCKET
// ============================================
const WebSocket = require('ws');
const server = app.listen(PORT, () => {
  
});

const wss = new WebSocket.Server({ server });


wss.on('connection', (ws, req) => {

  ws.on('close', () => {
  });

  ws.on('error', (err) => {
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

  server.close(() => {

    pool.end(() => {
})   
    process.exit(0);
  });
});