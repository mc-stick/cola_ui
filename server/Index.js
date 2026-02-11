
import express from 'express';
import cors from 'cors';
import WebSocket from 'ws';
import { imprimirTexto } from './Printservice.js';  // Asumiendo que tienes una función para imprimir
const app = express();
const PORT = 8080;
const externalWsUrl = 'ws://ip:3001'; // Cambia esto con la URL de tu WebSocket externo
let externalWs = null;

// Middleware
app.use(cors());
app.use(express.json());

// Función para conectarse al WebSocket externo
let reconnectAttempts = 0;

function connectToExternalWs() {
  externalWs = new WebSocket(externalWsUrl);

  externalWs.on('open', () => {
    console.log('Conectado al WebSocket externo');
    reconnectAttempts = 0; // Reseteamos el contador de reconexión al éxito
  });

   externalWs.on('message', (message) => {
    console.log('Mensaje recibido del WebSocket externo:', message);
    try {
      const parsedMessage = JSON.parse(message);
        console.log("pring llego msg",parsedMessage)
      // Verifica que sea el tipo de mensaje adecuado
      if (parsedMessage.event === 'print-ticket') {
        // Llamar a la función de impresión
        console.log('Imprimiendo ticket con los datos:', parsedMessage.data);
        // Aquí puedes agregar la lógica para imprimir
        imprimirTexto({ logo: "UCNE", description: 'Universidad Católica Nordestana', turno: parsedMessage.data.ticket, servicio: parsedMessage.data.servicio, footer: "pie de pagina" });
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  });

  externalWs.on('close', () => {
    console.log('Conexión con WebSocket externo cerrada');
    reconnect();
  });

  externalWs.on('error', (error) => {
    console.error('Error en WebSocket externo:', error);
    reconnect();
  });

  function reconnect() {
    reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Máximo 30 segundos de espera
    console.log(`Reintentando conexión en ${delay / 1000} segundos...`);
    setTimeout(connectToExternalWs, delay);
  }
}


// Conectarse al WebSocket externo cuando inicie el servidor
connectToExternalWs();

// Endpoint de impresión
// app.post('/print-ticket', async (req, res) => {
//   const reqs = req.body;

//   try {
//     console.log("Recibiendo solicitud de impresión...");

//     // Aquí decides lo que quieres hacer, en este caso, enviar un mensaje al WebSocket remoto
//     if (externalWs && externalWs.readyState === WebSocket.OPEN) {
//       const message = JSON.stringify({ tipo: 'print-ticket', data: reqs });
//       externalWs.send(message); // Envía la solicitud de impresión al WebSocket externo

//       // Esperamos por la respuesta del WebSocket externo y la reenviamos al cliente
//       res.json({
//         success: true,
//         message: 'Ticket impreso',
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'No se pudo conectar al WebSocket externo',
//       });
//     }

//   } catch (error) {
//     console.error('Error al procesar la impresión:', error.message);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

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
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de cierre del servidor
process.on('SIGINT', () => {
  console.log('\n Cerrando servidor...');
  process.exit(0);
});