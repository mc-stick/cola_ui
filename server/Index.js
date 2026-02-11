
import express from 'express';
import cors from 'cors';
import WebSocket from 'ws';
import { imprimirTexto } from './Printservice.js';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
const PORT = process.env.PORT;
const externalWsUrl = process.env.WEBSOCKET;
let externalWs = null;

app.use(cors());
app.use(express.json());

let reconnectAttempts = 0;

function connectToExternalWs() {
  externalWs = new WebSocket(externalWsUrl);

  externalWs.on('open', () => {
    console.log('Conectado al WebSocket externo');
    reconnectAttempts = 0;
  });

   externalWs.on('message', (message) => {
    //console.log('Mensaje recibido del WebSocket externo:', message);
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.event === 'print-ticket') {
        imprimirTexto({ logo: process.env.LOGO, description: process.env.DESCRIPTION, turno: parsedMessage.data.ticket, servicio: parsedMessage.data.servicio, footer: "pie de pagina" });
      }
    } catch (error) {
      //console.error('Error al procesar el mensaje:', error);
    }
  });

  externalWs.on('close', () => {
    //console.log('Conexión con WebSocket externo cerrada');
    reconnect();
  });

  externalWs.on('error', (error) => {
    //console.error('Error en WebSocket externo:', error);
    reconnect();
  });

  function reconnect() {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Máximo 30 segundos de espera
    //console.log(`Reintentando conexión en ${delay / 1000} segundos...`);
    setTimeout(connectToExternalWs, delay);
  }
}

connectToExternalWs();
 
// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    endpoints: {
      imprimir: 'POST /print',
    },
  });
});

// Iniciar el servidor
app.listen(PORT, async () => {
 // console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de cierre del servidor
process.on('SIGINT', () => {
  //console.log('\n Cerrando servidor...');
  process.exit(0);
});