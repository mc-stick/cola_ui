const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const { pool, testConnection, validarConexionLDAP } = require('./src/config/database');
const { msgtw } = require('./src/twilio/apiTwi.js');

const authRoutes = require('./src/routes/auth.routes');
const configRoutes = require('./src/routes/config.routes');
const mediosRoutes = require('./src/routes/medios.routes');
const serviciosRoutes = require('./src/routes/servicios.routes');
const departamentosRoutes = require('./src/routes/departamentos.routes');
const puestosRoutes = require('./src/routes/puestos.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const permisosRoutes = require('./src/routes/permisos.routes');
const operadorServiciosRoutes = require('./src/routes/operador-servicios.routes');
const ticketsRoutes = require('./src/routes/tickets.routes');
const estadisticasRoutes = require('./src/routes/estadisticas.routes');
const auditoriaRoutes = require('./src/routes/auditoria.routes');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/msg', msgtw);

testConnection();
validarConexionLDAP();   // eliminar todo esto en produccion.

app.use('/api/auth', authRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api/medios', mediosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/puestos', puestosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/usuarios', permisosRoutes);
app.use('/api', operadorServiciosRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api', auditoriaRoutes);



const server = app.listen(PORT, () => {
  console.log(`running ports ${PORT}`);
});

async function verificarServicios() {
  try {
    const resultados = await Promise.allSettled([
      testConnection(),
      validarConexionLDAP()
    ]);

    const dbOk = resultados[0].status === "fulfilled";
    const ldapOk = resultados[1].status === "fulfilled";

    return dbOk && ldapOk; // 👈 true solo si ambos funcionan
  } catch (error) {
    return false;
  }
}

app.get('/api/health', async (req, res) => {
  const ok = await verificarServicios();
console.log(ok,"server:")
  res.json({
    ok,
    db: ok, // opcional simplificado
    ldap: ok
  });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket on');

  ws.on('close', () => {
    console.log('WebSocket off');
  });

  ws.on('error', (err) => {
    console.error('Error en WebSocket:', err);
  });
});

app.post('/print', async (req, res) => {
  try {

    wss.emit("print-ticket",req.body);
    
    res.json({success:true});
  } catch (error) {
    console.error('Error obteniendo print local:', error);
    res.status(500).json({ error: "error del servidor"});
  }
});

global.notificarCambio = (tipo, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ tipo, data }));
    }
  });
};

process.on('SIGINT', () => {
  console.log('server off');
  server.close(() => {
    console.log('Servidor HTTP off');
    pool.end(() => {
      console.log('Pool db off');
      process.exit(0);
    });
  });
});