const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER || "localhost\\SQLEXPRESS",
  database: process.env.DB_NAME || "BoundlessMoments",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASS || "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("MSSQL Connected...");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed:", err.message);
    throw err;
  });

module.exports = { sql, poolPromise };
