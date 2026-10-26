require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jobsRoutes = require('./routes/jobs');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'job-service', status: 'ok', time: new Date().toISOString() }));
app.use('/jobs', jobsRoutes);

const PORT = process.env.PORT || 5002;
(async () => {
  try { await pool.query('SELECT 1'); console.log('job-service: MySQL connected'); }
  catch (e) { console.error('job-service: MySQL FAILED:', e.message); }
  app.listen(PORT, () => console.log(`job-service listening on :${PORT}`));
})();
