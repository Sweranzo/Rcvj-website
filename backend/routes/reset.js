const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

// Reset admin password route
router.post('/reset-admin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const query = 'UPDATE users SET password = ? WHERE username = "admin"';
        db.execute(query, [hashedPassword], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ 
                message: 'Admin password reset successfully',
                newPassword: 'admin123'
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;