const express = require('express');
const pool = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /applications  (Write/Apply) - seeker only
router.post('/', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Only job seekers can apply' });
    const { job_id, cover_letter, resume_url } = req.body;
    if (!job_id) return res.status(400).json({ message: 'job_id required' });
    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id=?', [job_id]);
    if (!jobs.length) return res.status(404).json({ message: 'Job not found' });
    if (jobs[0].status !== 'active') return res.status(400).json({ message: 'Job is closed' });
    try {
      const [r] = await pool.query(
        'INSERT INTO applications (job_id, seeker_id, cover_letter, resume_url) VALUES (?,?,?,?)',
        [job_id, req.user.id, cover_letter || null, resume_url || null]
      );
      const [rows] = await pool.query('SELECT * FROM applications WHERE id=?', [r.insertId]);
      return res.status(201).json({ application: rows[0] });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already applied to this job' });
      throw e;
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Apply failed' });
  }
});

// GET /applications?seeker_id=&job_id= (Read)
router.get('/', authRequired, async (req, res) => {
  try {
    const { seeker_id, job_id } = req.query;
    let sql = 'SELECT a.*, j.title AS job_title, j.company AS job_company, j.location AS job_location, u.name AS seeker_name, u.email AS seeker_email FROM applications a LEFT JOIN jobs j ON j.id=a.job_id LEFT JOIN users u ON u.id=a.seeker_id';
    const conds = [];
    const params = [];
    if (seeker_id) {
      if (Number(seeker_id) !== Number(req.user.id) && req.user.role !== 'recruiter') return res.status(403).json({ message: 'Forbidden' });
      conds.push('a.seeker_id = ?'); params.push(seeker_id);
    } else if (req.user.role === 'seeker') {
      conds.push('a.seeker_id = ?'); params.push(req.user.id);
    }
    if (job_id) { conds.push('a.job_id = ?'); params.push(job_id); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY a.applied_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ applications: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'List failed' });
  }
});

// GET /applications/:id (Read one)
router.get('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json({ application: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Fetch failed' });
  }
});

// PUT /applications/:id (Update status) - recruiter or owner withdraw handled separately
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['applied', 'shortlisted', 'rejected', 'hired', 'withdrawn'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const [rows] = await pool.query('SELECT * FROM applications WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const app = rows[0];
    // seeker can only withdraw own
    if (req.user.role === 'seeker') {
      if (app.seeker_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
      if (status !== 'withdrawn') return res.status(403).json({ message: 'Seekers can only withdraw' });
    }
    // recruiter must own the job
    if (req.user.role === 'recruiter') {
      const [jobs] = await pool.query('SELECT * FROM jobs WHERE id=?', [app.job_id]);
      if (!jobs.length || jobs[0].recruiter_id !== req.user.id) return res.status(403).json({ message: 'Not your job posting' });
    }
    await pool.query('UPDATE applications SET status=? WHERE id=?', [status, req.params.id]);
    const [upd] = await pool.query('SELECT * FROM applications WHERE id=?', [req.params.id]);
    res.json({ application: upd[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE /applications/:id (Withdraw/Delete) - owner seeker or job-owner recruiter
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM applications WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const app = rows[0];
    if (req.user.role === 'seeker' && app.seeker_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (req.user.role === 'recruiter') {
      const [jobs] = await pool.query('SELECT * FROM jobs WHERE id=?', [app.job_id]);
      if (!jobs.length || jobs[0].recruiter_id !== req.user.id) return res.status(403).json({ message: 'Not your job posting' });
    }
    await pool.query('DELETE FROM applications WHERE id=?', [req.params.id]);
    res.json({ message: 'Application removed' });
  } catch (e) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
