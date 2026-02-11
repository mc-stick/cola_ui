const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone = process.env.TWILIO_PHONE;
//const client = twilio(accountSid, authToken);  //ACTIVAR //produccion

async function createMessage(msg,to) {
  
  console.log("server TXT", to, 'sendermsg:',msg) // Desactivar  en produccion 

  const message = await client.messages.create({
    body: msg,
    from: phone,
    to: "+1"+to,
  });
}

module.exports = { createMessage };
