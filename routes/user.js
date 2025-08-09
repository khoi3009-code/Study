const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validate = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

// Validation rules
const userUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải từ 2-50 ký tự'),

  body('age')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Tuổi phải từ 1-100'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
];

// [GET] /users - Get all users with pagination, search, and sorting (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      search = '',
      page = 1,
      limit = 10,
      sort = 'name',
      order = 'asc'
    } = req.query;

    // Build search query
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Execute query
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
});

// [GET] /users/:id - Get single user (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
// [PUT] /users/:id - Update user (authenticated)
router.put('/:id', userUpdateValidation, validate, authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// [DELETE] /users/:id - Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// [PUT] /users/:id/role - Update user role (admin only)
router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'user'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ"
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Đã gán quyền ${role} cho ${user.name}`,
      data: {
        id: user.id,
        name: user.name,
        role: user.role
      }
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
