const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldap://prueba.local:389',
  // url: 'ldap://ldap.pruebaitp.com:389',
  tlsOptions: {
    rejectUnauthorized: false // solo para pruebas
  }
});

client.on('error', (err) => {
  console.error('Error de conexión:', err);
});

client.bind('Administrador@prueba.local', 'Proyecto2026', (err) => {
// client.bind('Administrator@ldap.pruebaitp.com', 'P@ssw0rd', (err) => {
  if (err) {
    console.error('❌ Bind falló:', err.message);
  } else {
    console.log('✅ Autenticado correctamente');
  }
});