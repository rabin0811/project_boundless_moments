// src/middleware/authMiddleware.js - NEW FILE (M5 Security Middleware)
const checkAuth = (req, res, next) => {
    // In a real application, this would verify a JWT token.
    // For assignment purposes, we log a warning but allow the request to proceed 
    // to enable client-side testing against the API endpoints.
    console.warn(`[SECURITY WARNING]: Route ${req.method} ${req.originalUrl} is protected 
        but requires a proper JWT/Session implementation for production use (M5).`);

    // To test the 401 response, uncomment the following:
    /*
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token || token !== 'ASSIGNMENT_FAKE_JWT_TOKEN') {
        return res.status(401).json({ message: 'Access Denied. Authorization required.' });
    }
    */
    next();
};

module.exports = {
    checkAuth,
};