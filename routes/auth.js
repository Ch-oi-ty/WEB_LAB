const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
      [name, email, hash, role || 'user'],
      (err) => {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        res.json({ message: 'Registered successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email=?', [email], async (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const redirect = '/pages/dashboard.html';

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
      },
      redirect
    });
  });
});

module.exports = router;