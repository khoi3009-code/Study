const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

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

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
];

const loginValidation = [
  body('gmail')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải từ 6 ký tự trở lên')
    .matches(/\d/)
    .withMessage('Mật khẩu mới phải chứa ít nhất 1 số'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),

  body('age')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Tuổi phải từ 1-120'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
];

// [POST] /auth/register - Register new user
router.post('/register', registerValidation, validate, authController.register);

// [POST] /auth/login - Login user
router.post('/login', loginValidation, validate, authController.login);

// [POST] /auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// [POST] /auth/logout - Logout user
router.post('/logout', authMiddleware, authController.logout);

// [GET] /auth/profile - Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

// [PUT] /auth/profile - Update current user profile
router.put('/profile', updateProfileValidation, validate, authMiddleware, authController.updateProfile);

// [PUT] /auth/change-password - Change password
router.put('/change-password', changePasswordValidation, validate, authMiddleware, authController.changePassword);

// [POST] /auth/reset-password - Reset password (public endpoint)
router.post('/reset-password', async (req, res) => {
  try {
    const { gmail, newPassword } = req.body;

    if (!gmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu mới là bắt buộc"
      });
    }

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Mật khẩu đã được cập nhật thành công"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: err.message
    });
  }
});

module.exports = router;

