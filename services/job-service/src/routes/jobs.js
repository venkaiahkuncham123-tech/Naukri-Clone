const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /jobs  (Write) - recruiter only
router.post('/', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters can post jobs' });
    const { title, company, logo_url, description, skills, location, job_type, experience_min, experience_max, salary_min, salary_max, vacancies } = req.body;
    if (!title || !company || !description) return res.status(400).json({ message: 'title, company, description are required' });
    const [r] = await pool.query(
      'INSERT INTO jobs (recruiter_id, title, company, logo_url, description, skills, location, job_type, experience_min, experience_max, salary_min, salary_max, vacancies) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, title, company, logo_url || null, description, skills || null, location || 'Remote', job_type || 'Full-time', experience_min ?? 0, experience_max ?? 5, salary_min || null, salary_max || null, vacancies || 1]
    );
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id=?', [r.insertId]);
    res.status(201).json({ job: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Create job failed' });
  }
});

// GET /jobs?q=&location=&job_type=&skills=&page=&limit= (Read + Search)
router.get('/', async (req, res) => {
  try {
    const { q, location, job_type, skills, mine, recruiter_id, status = 'active', page = 1, limit = 20 } = req.query;
    const conds = [];
    const params = [];
    if (status && status !== 'all') { conds.push('status = ?'); params.push(status); }
    if (location) { conds.push('location LIKE ?'); params.push(`%${location}%`); }
    if (job_type) { conds.push('job_type = ?'); params.push(job_type); }
    if (recruiter_id) { conds.push('recruiter_id = ?'); params.push(recruiter_id); }
    if (q) { conds.push('(title LIKE ? OR description LIKE ? OR skills LIKE ? OR company LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    if (skills) { conds.push('skills LIKE ?'); params.push(`%${skills}%`); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const lim = Math.min(Number(limit) || 20, 100);
    const off = (Math.max(Number(page) || 1, 1) - 1) * lim;
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM jobs ${where}`, params);
    const [rows] = await pool.query(`SELECT * FROM jobs ${where} ORDER BY created_at DESC LIMIT ${lim} OFFSET ${off}`, params);
    res.json({ total: countRows[0].total, page: Number(page) || 1, limit: lim, jobs: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'List jobs failed' });
  }
});

// GET /jobs/:id (Read one)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Job not found' });
    res.json({ job: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Fetch job failed' });
  }
});

// PUT /jobs/:id (Update) - owner recruiter only
router.put('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Job not found' });
    if (rows[0].recruiter_id !== req.user.id) return res.status(403).json({ message: 'Not your job' });
    const j = { ...rows[0], ...req.body };
    await pool.query(
      'UPDATE jobs SET title=?, company=?, logo_url=?, description=?, skills=?, location=?, job_type=?, experience_min=?, experience_max=?, salary_min=?, salary_max=?, vacancies=?, status=? WHERE id=?',
      [j.title, j.company, j.logo_url || null, j.description, j.skills || null, j.location, j.job_type, j.experience_min ?? 0, j.experience_max ?? 5, j.salary_min || null, j.salary_max || null, j.vacancies || 1, j.status || 'active', req.params.id]
    );
    const [upd] = await pool.query('SELECT * FROM jobs WHERE id=?', [req.params.id]);
    res.json({ job: upd[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Update job failed' });
  }
});

// DELETE /jobs/:id (Delete) - owner recruiter only
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Job not found' });
    if (rows[0].recruiter_id !== req.user.id) return res.status(403).json({ message: 'Not your job' });
    await pool.query('DELETE FROM jobs WHERE id=?', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete job failed' });
  }
});

module.exports = router;
