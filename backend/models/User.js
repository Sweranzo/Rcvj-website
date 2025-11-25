const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            db.execute(query, [userData.username, userData.email, hashedPassword, userData.role || 'admin'], 
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
        });
    }

    // Find user by username
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ?';
            db.execute(query, [username], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    // Find user by email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE email = ?';
            db.execute(query, [email], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    // Validate password
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;