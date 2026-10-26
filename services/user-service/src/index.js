require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'ok', time: new Date().toISOString() }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5001;
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('user-service: MySQL connected');
  } catch (e) {
    console.error('user-service: MySQL connection FAILED:', e.message);
  }
  app.listen(PORT, () => console.log(`user-service listening on :${PORT}`));
})();
