// src/database/db.js - Database connection setup

// Load environment variables from .env file
require('dotenv').config();

const sql = require('mssql');

// Configuration for connecting using Windows Authentication (Integrated Security)
const config = {
    // Reads DB_HOST (e.g., DESKTOP-VH42Q3P\SQLEXPRESS) from your .env file
    server: process.env.DB_HOST, 
    database: process.env.DB_NAME || 'boundless_db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    // CRITICAL: Must use the 'msnodesqlv8' driver for Windows Authentication
    // Requires: npm install msnodesqlv8
    driver: 'msnodesqlv8', 
    options: {
        encrypt: true, 
        trustServerCertificate: true, 
        // CRITICAL: This enables Windows Authentication / Integrated Security
        trustedConnection: true 
    }
};

/**
 * Establishes and returns a database connection pool.
 * If the connection fails, the application crashes to prevent runtime errors.
 * @returns {Promise<sql.ConnectionPool>} The MSSQL connection pool object.
 */
async function getConnection() {
    try {
        await sql.connect(config);
        console.log("Database connection successful.");
        return sql;
    } catch (err) {
        // Logging the critical error and crashing the app
        console.error(`Database connection failed! ${err.message}`);
        process.exit(1);
    }
}

// Export the connection logic and sql object for use in controllers
module.exports = {
    getConnection,
    sql
};
