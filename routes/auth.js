const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const validate = require('../middleware/validationMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),

  body('gmail')
    .trim()
    .isEmail()
    .withMessage('Gmail không hợp lệ')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải từ 6 ký tự trở lên')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 số'),

  body('sdt')
    .matches(/^[0-9]{10}$/)
    .withMessage('Số điện thoại phải có 10 chữ số'),

  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Tuổi phải từ 1-120'),
];

// Đăng ký
router.post('/register', registerValidation, validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, password, gmail, sdt, gender, age } = req.body;

    const exist = await User.findOne({ $or: [{ gmail }, { sdt }] });
    if (exist) return res.status(400).json({ message: 'Gmail hoặc SĐT đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, gmail, password: hashedPassword, sdt, gender, age });
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { gmail, password } = req.body;
    const user = await User.findOne({ gmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Sai thông tin đăng nhập" });
    }

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("🚪 JWT_SECRET khi đăng nhập:", process.env.JWT_SECRET);

    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// [POST] /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { gmail, newPassword } = req.body;

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng với Gmail này" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.json({ message: "Mật khẩu đã được cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
});

module.exports = router;

