const mysql = require('mysql2/promise');

// Debug: mostrar valores de conexión (quitar en producción)
console.log('[DB Config] Conectando a MySQL:');
console.log(`  Host    : ${process.env.DB_HOST}`);
console.log(`  Port    : ${process.env.DB_PORT || '3306 (default)'}`);
console.log(`  User    : ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  SSL     : ${process.env.DB_SSL === 'true' ? 'Sí' : 'No'}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  timezone: 'Z',
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
  connectTimeout: 10000,
});

module.exports = pool;

