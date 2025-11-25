const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Extended database initialization with applications table
router.get('/init-v2', async (req, res) => {
    try {
        console.log('Starting extended database initialization...');
        
        // Create applications table
        await db.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                application_id VARCHAR(50) UNIQUE NOT NULL,
                job_id INT,
                job_title VARCHAR(200) NOT NULL,
                job_company VARCHAR(200) NOT NULL,
                applicant_name VARCHAR(100) NOT NULL,
                applicant_email VARCHAR(100) NOT NULL,
                applicant_phone VARCHAR(20) NOT NULL,
                cover_letter TEXT,
                resume_filename VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                notes TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Applications table created');

        res.json({ 
            success: true, 
            message: 'Extended database initialized successfully!',
            tables: ['users', 'jobs', 'applications']
        });
        
    } catch (error) {
        console.error('❌ Extended database initialization failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;