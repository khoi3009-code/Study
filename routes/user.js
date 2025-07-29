const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

const isAdmin = (req, res, next) => {
  if (req.res.role != 'admin') return res.status(403).json({message: "Không đủ quyền"});
  next();
};

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

// [GET] /users - Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [POST] /users - Create new user (public or admin use)
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', authenticateToken, adminMiddleware, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 5, sort = 'name' } = req.query;

    const query = {
      name: { $regex: search, $options: 'i' }, // tìm kiếm không phân biệt hoa thường
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ [sort]: 1 }) // tăng dần; dùng -1 nếu muốn giảm dần
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// [GET] /users/:id - Get single user (authenticated)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // không trả về password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
// [PUT] /users/:id - Update user (authenticated)
router.put('/:id', userUpdateValidation, validate, authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [DELETE] /users/:id - Delete user (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(`/:id/role`, authenticateToken, adminMiddleware, isAdmin, async (req, res) => {
  const { role } = req.body;
  const validRoles =['admin', 'user'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Vai trò không hợp lệ"});
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({message: "Người dùng đã tồn tại"});
    
    user.role = role;
    await user.save();

    res.json({ message: `Đã gán quyền ${role} cho ${user.name}`});
  } catch (err){
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message});
  }
});

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, sort = 'createdAt_desc' } = req.query;

    // Tìm kiếm theo tên (name)
    const query = search
      ? { name: { $regex: search, $options: 'i' } } // không phân biệt hoa thường
      : {};

    // Phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sắp xếp
    const [sortField, sortOrder] = sort.split('_');
    const sortObj = {};
    sortObj[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Truy vấn DB
    const users = await User.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Tổng số trang
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      page: parseInt(page),
      totalPages,
      totalUsers: total,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
