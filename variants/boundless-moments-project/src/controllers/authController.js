// src/controllers/authController.js
const db = require('../database/db');
const bcrypt = require('bcrypt'); 

// Handler for POST /api/login (Admin Login)
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = `SELECT password_hash FROM admin_users WHERE username = @p0;`; 
        const result = await db.query(sql, [username]); 

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const hashedPassword = result.recordset[0].password_hash;

        // 2. Compare the plain text password with the hashed password (M5)
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            // Success: Return a fake token for client-side redirection/storage
            return res.status(200).json({ 
                message: 'Login successful', 
                token: 'ASSIGNMENT_FAKE_JWT_TOKEN' 
            });
        } else {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

module.exports = {
    login,
};