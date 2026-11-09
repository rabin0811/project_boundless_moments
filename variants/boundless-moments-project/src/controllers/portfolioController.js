// src/controllers/portfolioController.js - FULL CRUD IMPLEMENTED (P6)
const db = require('../database/db');

const getAllPortfolioItems = async (req, res) => {
    const sql = `SELECT id, title, description, category, image_url, date_created FROM portfolio_items ORDER BY date_created DESC;`;
    try {
        const result = await db.query(sql);
        res.status(200).json(result.recordset); 
    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        res.status(500).json({ message: 'Internal server error while fetching portfolio data.' });
    }
};

const createPortfolioItem = async (req, res) => {
    const { title, description, category, image_url } = req.body; 

    if (!title || !image_url) {
        return res.status(400).json({ message: 'Title and image URL are required for a new portfolio item.' });
    }

    const sql = `
        INSERT INTO portfolio_items (title, description, category, image_url)
        VALUES (@p0, @p1, @p2, @p3);
    `;
    const values = [title, description || null, category || 'general', image_url];

    try {
        await db.query(sql, values);
        res.status(201).json({ 
            message: 'Portfolio item created successfully.'
        });
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        res.status(500).json({ message: 'Internal server error while creating item.' });
    }
};

const updatePortfolioItem = async (req, res) => {
    const { id } = req.params;
    const { title, description, category, image_url } = req.body;

    if (!title || !image_url) {
        return res.status(400).json({ message: 'Title and image URL are required for updating.' });
    }

    const sql = `
        UPDATE portfolio_items
        SET title = @p0, 
            description = @p1, 
            category = @p2, 
            image_url = @p3
        WHERE id = @p4;
    `;
    const values = [title, description || null, category || 'general', image_url, id];

    try {
        const result = await db.query(sql, values);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Portfolio item not found for update.' });
        }
        
        res.status(200).json({ message: `Portfolio item with ID ${id} updated successfully.` });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ message: 'Internal server error while updating item.' });
    }
};

const deletePortfolioItem = async (req, res) => {
    const { id } = req.params; 

    const sql = `DELETE FROM portfolio_items WHERE id = @p0;`;
    
    try {
        const result = await db.query(sql, [id]);
        
        if (result.rowsAffected[0] === 0) { 
            return res.status(404).json({ message: 'Portfolio item not found.' });
        }
        res.status(200).json({ message: `Portfolio item with ID ${id} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({ message: 'Internal server error while deleting item.' });
    }
};

module.exports = {
    getAllPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
};