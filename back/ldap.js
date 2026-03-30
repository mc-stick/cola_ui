const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldaps://172.16.0.141:636',
  tlsOptions: {
    rejectUnauthorized: false // solo para pruebas
  }
});

client.on('error', (err) => {
  console.error('Error de conexión:', err);
});

client.bind('Administrador@prueba.local', 'Proyecto2026', (err) => {
  if (err) {
    console.error('❌ Bind falló:', err.message);
  } else {
    console.log('✅ Autenticado correctamente');
  }
});