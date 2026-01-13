const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/print', async (req, res) => {
  try {
    const {ticketNumber, message } = req.body;
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// WEBSOCKET
const WebSocket = require('ws');
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════╗');
  console.log('║  RUNNING ON BACKGROUND   ║');
  console.log('╚══════════════════════════╝');
  console.log('');
  console.log(`🌐 Servidor: http://localhost:${PORT}`);
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
  console.log('\n Cerrando servidor...');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});