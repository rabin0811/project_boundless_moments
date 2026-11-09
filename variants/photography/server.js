// Backend server using Express and mysql2
const express = require('express');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// serve static front-end
app.use('/', express.static(path.join(__dirname, 'public')));

// MySQL connection pool
const pool = mysqlPromise.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'timeless_memories',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// File upload for portfolio images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// API: submit contact inquiry
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const sql = 'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)';
    await (await pool).execute(sql, [name, email, message]);
    res.json({ success: true, message: 'Inquiry saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: admin login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await (await pool).execute('SELECT * FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // Simple session token, for demo only. In production use JWT or proper sessions.
    res.json({ success: true, message: 'Login OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: list inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const [rows] = await (await pool).execute('SELECT id, name, email, message, created_at FROM inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: add portfolio item with image upload
app.post('/api/portfolio', upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    let imagePath = null;
    if (req.file) {
      imagePath = '/images/' + req.file.filename;
    }
    const sql = 'INSERT INTO portfolio (title, image, description) VALUES (?, ?, ?)';
    await (await pool).execute(sql, [title, imagePath, description || null]);
    res.json({ success: true, message: 'Portfolio item added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API: fetch portfolio items
app.get('/api/portfolio', async (req, res) => {
  try {
    const [rows] = await (await pool).execute('SELECT id, title, image, description FROM portfolio ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// serve uploaded images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
