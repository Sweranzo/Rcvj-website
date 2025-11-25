require('dotenv').config();

let connection;

if (process.env.DATABASE_URL) {
    // Production - PostgreSQL
    const { Pool } = require('pg');
    connection = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    console.log('Connected to PostgreSQL database');
} else {
    // Development - MySQL
    const mysql = require('mysql2');
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect((err) => {
        if (err) {
            console.error('MySQL connection failed: ' + err.stack);
            return;
        }
        console.log('Connected to MySQL database as id ' + connection.threadId);
    });
}

module.exports = connection;