const User = require('../models/User');

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả người dùng
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      gmail: u.gmail,
      password: u.password,
      sdt: u.sdt,
      role: u.role,
      _id: u._id
    }));

    res.json(formattedUsers); // <- Trả về kết quả đã format đúng thứ tự
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá người dùng
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// controllers/userController.js
exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Logic tạo user và lưu vào DB (bạn có thể dùng bcrypt + mongoose)
        // VD:
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
