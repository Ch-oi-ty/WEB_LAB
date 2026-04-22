const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all budgets for logged-in user
router.get('/', auth, (req, res) => {
  db.query(
    'SELECT * FROM budgets WHERE user_id=? ORDER BY year DESC, month DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// Add or update budget for a category/month/year
router.post('/', auth, (req, res) => {
  const { category, amount, month, year } = req.body;

  // Check if budget already exists for this category/month/year
  db.query(
    'SELECT * FROM budgets WHERE user_id=? AND category=? AND month=? AND year=?',
    [req.user.id, category, month, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length) {
        // Update existing budget
        db.query(
          'UPDATE budgets SET amount=? WHERE user_id=? AND category=? AND month=? AND year=?',
          [amount, req.user.id, category, month, year],
          () => res.json({ message: 'Budget updated' })
        );
      } else {
        // Insert new budget
        db.query(
          'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?,?,?,?,?)',
          [req.user.id, category, amount, month, year],
          (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId, message: 'Budget added' });
          }
        );
      }
    }
  );
});

// Delete a budget by ID
router.delete('/:id', auth, (req, res) => {
  db.query(
    'DELETE FROM budgets WHERE id=? AND user_id=?',
    [req.params.id, req.user.id],
    () => res.json({ message: 'Budget deleted' })
  );
});

module.exports = router;