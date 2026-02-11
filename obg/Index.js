import express from 'express';
import cors from 'cors';
import { imprimirTexto } from './Printservice.js';
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.post('/imprimir', async (req, res) => {
  const reqs = req.body;
  try {
   imprimirTexto({ logo: "UCNE", description: 'Universidad Católica Nordestana.', turno: reqs.turno, servicio: reqs.service, footer: "pie de pagina" });
     res.json({ 
      success: true, 
      message: 'Ticket impreso'
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});


app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    endpoints: {
      imprimir: 'POST /imprimir',
    }
  });
});


app.listen(PORT, async () => {

  console.log(` Servidor: http://localhost:${PORT}`);

});

process.on('SIGINT', () => {
  console.log('\n Cerrando servidor...');
  process.exit(0);
});