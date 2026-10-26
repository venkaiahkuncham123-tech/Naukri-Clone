const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'naukri_secret_dev_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function sanitize(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /auth/register  (Write)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'seeker', phone, headline, skills, experience_years, location, company_name } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' });
    if (!['seeker', 'recruiter'].includes(role)) return res.status(400).json({ message: 'role must be seeker or recruiter' });
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone, headline, skills, experience_years, location, company_name) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [name, email, password_hash, role, phone || null, headline || null, skills || null, experience_years || 0, location || null, company_name || null]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
    const user = sanitize(rows[0]);
    res.status(201).json({ user, token: sign(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Register failed' });
  }
});

// POST /auth/login (Read/verify)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const user = sanitize(rows[0]);
    res.json({ user, token: sign(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /auth/me (Read)
router.get('/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ user: sanitize(rows[0]) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

module.exports = router;
