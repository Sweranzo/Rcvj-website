const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const query = 'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *';
            
            const result = await db.query(query, [
                userData.username, 
                userData.email, 
                hashedPassword, 
                userData.role || 'admin'
            ]);
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Find user by username
    static async findByUsername(username) {
        try {
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await db.query(query, [username]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Validate password
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;