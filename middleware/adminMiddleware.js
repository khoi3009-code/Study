const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
};

module.exports = adminMiddleware;
