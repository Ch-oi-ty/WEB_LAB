const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── MySQL Connection ──
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
  }
});

// ── Frontend Path (IMPORTANT FIX) ──
const FRONTEND_PATH = path.join(__dirname, 'frontend');

// Serve static files
app.use(express.static(FRONTEND_PATH));

// ── API Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/groups', require('./routes/groups'));

// ── HTML Routes ──
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'pages/login.html'));
});

app.get('/pages/dashboard.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'pages/dashboard.html'));
});

app.get('/pages/groups.html', (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'pages/groups.html'));
});

// ── 404 fallback ──
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(FRONTEND_PATH, 'pages/login.html'));
});

// ── PORT ──
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});