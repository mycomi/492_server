const mysql = require('mysql');
const fs = require('fs');

const db = mysql.createPool({
    host: process.env.DATABASE_HOST ,
    user: process.env.DATABASE_USER ,
    password: process.env.DATABASE_PASSWORD ,
    database: process.env.DATABASE,
    port: process.env.PORT,
    ssl: {ca: fs.readFileSync("./BaltimoreCyberTrustRoot.crt.pem")},
    connectionLimit: 10,
  });

module.exports = db;