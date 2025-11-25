const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Database initialization endpoint
router.get('/init', async (req, res) => {
    try {
        console.log('Starting database initialization...');
        
        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create jobs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                company VARCHAR(200) NOT NULL,
                location VARCHAR(100) NOT NULL,
                salary_range VARCHAR(100),
                job_type VARCHAR(20) DEFAULT 'full-time',
                description TEXT NOT NULL,
                requirements TEXT NOT NULL,
                responsibilities TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Jobs table created');

        // Insert default admin user
        await db.query(`
            INSERT INTO users (username, email, password, role) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', 'admin@rcvjcompany.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin']);
        console.log('✅ Admin user created');

        res.json({ 
            success: true, 
            message: 'Database initialized successfully!',
            tables: ['users', 'jobs']
        });
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;