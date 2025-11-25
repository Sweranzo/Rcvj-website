const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Test route - to verify auth routes are working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth API is working!' });
});

// Simple login route without database checks
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
    try {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        console.log('Username:', username);
        console.log('Password:', password);

        // Simple hardcoded authentication for testing
        if (username === 'admin' && password === 'admin123') {
            console.log('✅ Login successful');
            
            // Generate JWT token
            const payload = {
                user: {
                    id: 1,
                    username: 'admin',
                    role: 'super_admin'
                }
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || 'rcvj_company_secret_2024',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@rcvjcompany.com',
                    role: 'super_admin'
                }
            });
        } else {
            console.log('❌ Invalid credentials');
            res.status(400).json({ error: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('🚨 Login error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Register route (optional)
router.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role } = req.body;

        // Create user using the model
        await User.create({ username, email, password, role });
        res.json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;