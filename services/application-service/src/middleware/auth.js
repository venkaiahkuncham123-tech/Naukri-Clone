const jwt = require('jsonwebtoken');
function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing auth token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'naukri_secret_dev_change_me');
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
module.exports = { authRequired };
