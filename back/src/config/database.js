const mysql = require('mysql2/promise');
require('dotenv').config();
const ldap = require("ldapjs");
const ldapUrl = process.env.LDAP_URL;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 100000,
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('db on');
    conn.release();
  } catch (err) {
    console.error('db fail', err.message);
  }
};

function validarConexionLDAP() {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: ldapUrl });

    const serviceUser = process.env.LDAP_BIND_USER;
    const servicePass = process.env.LDAP_BIND_PASSWORD;

    client.bind(serviceUser, servicePass, (err) => {
      if (err) {
        client.unbind();
        console.log("ldap reject")
        return reject({
          ok: false,
          type: "LDAP_CONN",
          message: "No se pudo conectar al LDAP",
          error: err.message,
        });
       
      }

      // 👇 conexión exitosa
      client.unbind();
      console.log("ldap connect")
      resolve({
        ok: true,
        message: "LDAP disponible",
      });
    });
  });
}

module.exports = { pool, testConnection, validarConexionLDAP };
