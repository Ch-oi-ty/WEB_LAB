const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

// Create group
router.post('/', auth, (req, res) => {
  const { name } = req.body;
  db.query(
    'INSERT INTO groups_table (name, created_by) VALUES (?,?)',
    [name, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      // Auto-add creator as member
      db.query(
        'INSERT INTO group_members (group_id, user_id) VALUES (?,?)',
        [result.insertId, req.user.id],
        () => res.json({ id: result.insertId, message: 'Group created' })
      );
    }
  );
});

// Get my groups
router.get('/', auth, (req, res) => {
  db.query(
    `SELECT g.*, COUNT(gm.user_id) as member_count 
     FROM groups_table g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = ?
     GROUP BY g.id`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});

// Add member by email
router.post('/:id/members', auth, (req, res) => {
  const { email } = req.body;
  db.query('SELECT id FROM users WHERE email=?', [email], (err, rows) => {
    if (!rows || !rows.length) 
      return res.status(404).json({ error: 'User not found' });
    db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?,?)',
      [req.params.id, rows[0].id],
      (err2) => {
        if (err2) return res.status(400).json({ error: 'Already a member' });
        res.json({ message: 'Member added' });
      }
    );
  });
});

// Get group members
router.get('/:id/members', auth, (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.email FROM users u
     JOIN group_members gm ON u.id = gm.user_id
     WHERE gm.group_id = ?`,
    [req.params.id],
    (err, rows) => res.json(rows || [])
  );
});

// Add group expense
router.post('/:id/expenses', auth, (req, res) => {
  const { title, amount, date, note } = req.body;
  db.query(
    'INSERT INTO group_expenses (group_id, paid_by, title, amount, date, note) VALUES (?,?,?,?,?,?)',
    [req.params.id, req.user.id, title, amount, date, note || ''],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, message: 'Expense added' });
    }
  );
});

// Get group expenses
router.get('/:id/expenses', auth, (req, res) => {
  db.query(
    `SELECT ge.*, u.name as paid_by_name FROM group_expenses ge
     JOIN users u ON ge.paid_by = u.id
     WHERE ge.group_id = ? ORDER BY ge.date DESC`,
    [req.params.id],
    (err, rows) => res.json(rows || [])
  );
});

module.exports = router;