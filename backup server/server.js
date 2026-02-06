const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();

const { pool, testConnection } = require('./src/config/database');
const { msgtw } = require('./twilio/apiTwi.js');

const authRoutes = require('./src/routes/auth.routes');
const configRoutes = require('./src/routes/config.routes');
const mediosRoutes = require('./src/routes/medios.routes');
const serviciosRoutes = require('./src/routes/servicios.routes');
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

testConnection();   // eliminar todo esto en produccion.

app.use('/api/auth', authRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api/medios', mediosRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/puestos', puestosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/usuarios', permisosRoutes);
app.use('/api', operadorServiciosRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api', auditoriaRoutes);

const server = app.listen(PORT, () => {
  console.log(`running port ${PORT}`);
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