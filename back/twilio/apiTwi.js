const express = require('express');
const { createMessage } = require ('./twi.js');

const router = express.Router();

router.post('/', async (req, res) => {
  console.log("BODY recibido:", req.body);
  const { msg,to } = req.body;
  
  try {
    console.log("first")
    const result = await createMessage(msg,to);
    console.log("second")
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creando el mensaje' });
  }
});

module.exports = { msgtw: router };
