const jwt = require('jsonwebtoken');
const JWT_SECRET = '123';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, 123);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền admin' });
  }
  next();
}

module.exports = { authenticateToken, isAdmin };
