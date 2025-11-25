const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // FIX: token stores user inside decoded.user
        const username = decoded.user?.username;

        if (!username) {
            return res.status(401).json({ error: 'Token is not valid (missing username)' });
        }

        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({ error: 'User not found for this token' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = auth;
