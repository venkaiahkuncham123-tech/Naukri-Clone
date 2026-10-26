require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
app.use(morgan('dev'));

const USER = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const JOB = process.env.JOB_SERVICE_URL || 'http://localhost:5002';
const APP = process.env.APPLICATION_SERVICE_URL || 'http://localhost:5003';

app.get('/health', (req, res) => res.json({
  service: 'api-gateway', status: 'ok',
  routes: { auth: `${USER}/auth`, users: `${USER}/users`, jobs: `${JOB}/jobs`, applications: `${APP}/applications` },
  time: new Date().toISOString(),
}));

app.use('/api/auth', createProxyMiddleware({ target: USER, changeOrigin: true, pathRewrite: { '^/api/auth': '/auth' } }));
app.use('/api/users', createProxyMiddleware({ target: USER, changeOrigin: true, pathRewrite: { '^/api/users': '/users' } }));
app.use('/api/jobs', createProxyMiddleware({ target: JOB, changeOrigin: true, pathRewrite: { '^/api/jobs': '/jobs' } }));
app.use('/api/applications', createProxyMiddleware({ target: APP, changeOrigin: true, pathRewrite: { '^/api/applications': '/applications' } }));

app.use((req, res) => res.status(404).json({ message: 'Gateway: route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`api-gateway listening on :${PORT}`));
