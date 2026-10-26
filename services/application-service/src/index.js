require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const appRoutes = require('./routes/applications');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'application-service', status: 'ok', time: new Date().toISOString() }));
app.use('/applications', appRoutes);

const PORT = process.env.PORT || 5003;
(async () => {
  try { await pool.query('SELECT 1'); console.log('application-service: MySQL connected'); }
  catch (e) { console.error('application-service: MySQL FAILED:', e.message); }
  app.listen(PORT, () => console.log(`application-service listening on :${PORT}`));
})();
