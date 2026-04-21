const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4SRakF67TEEOktA.root',
  password: 'RyZej8OlH5pRBPnW',
  database: 'zengo_system',
  ssl: {
    ca: fs.readFileSync('ca-cert.pem'),
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
