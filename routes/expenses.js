const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

// Get all expenses for logged-in user
router.get('/', auth, (req, res) => {
  db.query(
    'SELECT * FROM expenses WHERE user_id=? ORDER BY date DESC',
    [req.user.id],
    (err, rows) => res.json(rows)
  );
});

// Add new expense
router.post('/', auth, (req, res) => {
  const { title, amount, category, type, payment_method, note, date } = req.body;
  db.query(
    'INSERT INTO expenses (user_id,title,amount,category,type,payment_method,note,date) VALUES (?,?,?,?,?,?,?,?)',
    [req.user.id, title, amount, category, type, payment_method, note, date],
    (err, result) => res.json({ id: result.insertId, message: 'Added!' })
  );
});

// Delete expense
router.delete('/:id', auth, (req, res) => {
  db.query(
    'DELETE FROM expenses WHERE id=? AND user_id=?',
    [req.params.id, req.user.id],
    () => res.json({ message: 'Deleted' })
  );
});

module.exports = router;