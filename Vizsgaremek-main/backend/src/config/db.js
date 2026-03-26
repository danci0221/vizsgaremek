// src/config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    // FONTOS: Dockerben a host neve 'db', nem localhost!
    // A || jelek utáni rész akkor lép életbe, ha nem találja a környezeti változót.
    host: process.env.DB_HOST || 'db', 
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppw',
    // A docker-compose-ban DB_DATABASE néven adtuk át, itt is azt használjuk
    database: process.env.DB_DATABASE || 'mozipont_beta',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();