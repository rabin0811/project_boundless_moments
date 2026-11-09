// src/controllers/contactController.js
const db = require('../database/db');

// Handler for POST /api/contact (Saves a new message)
const submitMessage = async (req, res) => {
    const { sender_name, sender_email, subject, message } = req.body;

    if (!sender_name || !sender_email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const sql = `
        INSERT INTO client_messages (sender_name, sender_email, subject, message)
        VALUES (@p0, @p1, @p2, @p3);
    `;
    const values = [sender_name, sender_email, subject, message];

    try {
        await db.query(sql, values); 
        res.status(201).json({ 
            message: 'Message sent successfully.' 
        });
    } catch (error) {
        console.error('Error submitting contact message:', error);
        res.status(500).json({ message: 'Internal server error while saving message.' });
    }
};

// Handler for GET /api/messages (Retrieves all messages for the Admin Panel) (P6)
const getAllMessages = async (req, res) => {
    // This route is protected by checkAuth middleware
    const sql = `SELECT * FROM client_messages ORDER BY received_at DESC;`;
    
    try {
        const result = await db.query(sql);
        res.status(200).json(result.recordset); 
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error while fetching messages.' });
    }
};

module.exports = {
    submitMessage,
    getAllMessages
};