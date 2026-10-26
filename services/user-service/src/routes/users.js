const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

function sanitize(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

// GET /users/:id (Read)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitize(rows[0]) });
  } catch (e) {
    res.status(500).json({ message: 'Fetch failed' });
  }
});

// PUT /users/:id (Update) - self only
router.put('/:id', authRequired, async (req, res) => {
  try {
    if (Number(req.params.id) !== Number(req.user.id)) return res.status(403).json({ message: 'You can only update your own profile' });
    const { name, phone, headline, skills, experience_years, location, company_name } = req.body;
    await pool.query(
      'UPDATE users SET name=COALESCE(?,name), phone=?, headline=?, skills=?, experience_years=?, location=?, company_name=? WHERE id=?',
      [name || null, phone || null, headline || null, skills || null, experience_years ?? 0, location || null, company_name || null, req.user.id]
    );
    // handle name null-coalesce edge: if name provided update it
    if (name) await pool.query('UPDATE users SET name=? WHERE id=?', [name, req.user.id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [req.user.id]);
    res.json({ user: sanitize(rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE /users/:id (Delete) - self only
router.delete('/:id', authRequired, async (req, res) => {
  try {
    if (Number(req.params.id) !== Number(req.user.id)) return res.status(403).json({ message: 'You can only delete your own account' });
    await pool.query('DELETE FROM users WHERE id=?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
