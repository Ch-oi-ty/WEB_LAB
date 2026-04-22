const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');


// 📊 1. Monthly Expense Summary (month + year)
router.get('/monthly', auth, (req, res) => {
  db.query(
    `SELECT 
        MONTH(date) AS month,
        YEAR(date) AS year,
        SUM(amount) AS total
     FROM expenses
     WHERE user_id=?
     GROUP BY YEAR(date), MONTH(date)
     ORDER BY year DESC, month DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});


// 📊 2. Category-wise Expense Summary
router.get('/categories', auth, (req, res) => {
  db.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses
     WHERE user_id=?
     GROUP BY category`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});


// 📊 3. Budget vs Actual Spending (IMPORTANT 🔥)
router.get('/budget-vs-actual', auth, (req, res) => {
  const { month, year } = req.query;

  db.query(
    `SELECT 
        b.category,
        b.amount AS budget,
        IFNULL(SUM(e.amount), 0) AS spent,
        (b.amount - IFNULL(SUM(e.amount), 0)) AS remaining
     FROM budgets b
     LEFT JOIN expenses e 
       ON b.user_id = e.user_id 
       AND b.category = e.category
       AND MONTH(e.date) = ?
       AND YEAR(e.date) = ?
     WHERE b.user_id = ?
       AND b.month = ?
       AND b.year = ?
     GROUP BY b.category`,
    [month, year, req.user.id, month, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    }
  );
});


// 📊 4. Overspending Alert 🚨
router.get('/alerts', auth, (req, res) => {
  const { month, year } = req.query;

  db.query(
    `SELECT 
        b.category,
        b.amount AS budget,
        IFNULL(SUM(e.amount), 0) AS spent
     FROM budgets b
     LEFT JOIN expenses e 
       ON b.user_id = e.user_id 
       AND b.category = e.category
       AND MONTH(e.date) = ?
       AND YEAR(e.date) = ?
     WHERE b.user_id = ?
       AND b.month = ?
       AND b.year = ?
     GROUP BY b.category
     HAVING spent > budget`,
    [month, year, req.user.id, month, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      res.json({
        message: rows.length ? "Overspending detected!" : "All good 👍",
        data: rows
      });
    }
  );
});

module.exports = router;