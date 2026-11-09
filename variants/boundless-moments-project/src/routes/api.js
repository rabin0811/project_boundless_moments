// src/routes/api.js - COMPLETED with Auth Middleware
const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const portfolioController = require('../controllers/portfolioController');
const authController = require('../controllers/authController');
const { checkAuth } = require('../middleware/authMiddleware'); // <-- NEW IMPORT

// --- Authentication Route (M5) ---
router.post('/login', authController.login);

// --- PUBLIC Contact Route (P6) ---
router.post('/contact', contactController.submitMessage);

// --- PROTECTED Admin Routes (M5) ---

// MESSAGES: GET is protected
router.get('/messages', checkAuth, contactController.getAllMessages); 

// PORTFOLIO: READ is public, others are protected
router.get('/portfolio', portfolioController.getAllPortfolioItems); 
router.post('/portfolio', checkAuth, portfolioController.createPortfolioItem);
router.put('/portfolio/:id', checkAuth, portfolioController.updatePortfolioItem); // FULL CRUD (P6)
router.delete('/portfolio/:id', checkAuth, portfolioController.deletePortfolioItem); 

module.exports = router;