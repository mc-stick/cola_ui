const express = require('express');
const { createMessage } = require ('./twi.js');

const router = express.Router();

router.post('/', async (req, res) => {
  const { msg,to } = req.body;
  
  try {
    const result = await createMessage(msg,to);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creando el mensaje' });
  }
});

module.exports = { msgtw: router };
