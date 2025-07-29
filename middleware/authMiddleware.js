require('dotenv').config(); 

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization
  // const token = authHeader && authHeader.split(' ')[1];

  console.log("📥 Token nhận được:", token);
  console.log("🔐 JWT_SECRET middleware:", process.env.JWT_SECRET);

  if (!token) return res.status(401).json({ message: 'Không có token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token không hợp lệ:", err.message);
      return res.status(403).json({ message: 'Token không hợp lệ' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
