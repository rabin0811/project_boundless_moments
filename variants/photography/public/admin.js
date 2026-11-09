// Run once to create admin user. Use: node create_admin.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'timeless_memories',
    waitForConnections: true,
    connectionLimit: 5
  });

  const username = process.env.ADMIN_USERNAME || 'admin';
  const plain = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(plain, 10);

  const [rows] = await pool.query('SELECT id FROM admin WHERE username = ?', [username]);
  if (rows.length > 0) {
    console.log('Admin already exists. To reset password, update DB or delete admin row and rerun.');
    process.exit(0);
  }

  await pool.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hash]);
  console.log('Admin user created:', username);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
