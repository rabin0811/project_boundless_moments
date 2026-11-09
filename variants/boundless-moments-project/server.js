
const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_HOST,
    database: process.env.DB_NAME || 'boundless_db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,

    options: {
        trustedConnection: true,

        encrypt: false,
        trustServerCertificate: true,

        enableArithAbort: true
    }
};

const pool = new sql.ConnectionPool(config)
    .connect()
    .then(connection => {
        console.log('Connected to MSSQL database.');
        return connection;
    })
    .catch(err => {
        console.error('Database connection failed!', err.message);
        process.exit(1);
    });

module.exports = {
    query: async (text, params = []) => {
        const conn = await pool;
        const request = conn.request();

        // Bind parameters securely to prevent SQL injection
        params.forEach((param, index) => {
            request.input(`p${index}`, param);
        });

        // Replace $1, $2, etc., placeholders in the query text with @p0, @p1, etc., for MSSQL
        let mssqlText = text;
        params.forEach((_, index) => {
            mssqlText = mssqlText.replace(`$${index + 1}`, `@p${index}`);
        });

        try {
            const result = await request.query(mssqlText);
            return result;
        } catch (error) {
            console.error('MSSQL Query Error:', error.message);
            throw error;
        }
    },
    sql
};