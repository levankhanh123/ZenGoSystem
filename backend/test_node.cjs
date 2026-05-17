const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'zengo',
  ssl: {
    ca: fs.readFileSync(process.env.MYSQL_ATTR_SSL_CA || 'ca-cert.pem'),
    rejectUnauthorized: true
  }
});

connection.connect((err) => {
  if (err) {
    console.error('ERROR CONNECTING:', err.message);
    return;
  }
  console.log('SUCCESS: Connected to TiDB');
  connection.end();
});
