const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Generate tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { gmail, password } = req.body;

    // Validate input
    if (!gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và mật khẩu là bắt buộc"
      });
    }

    // Find user
    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác"
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác"
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user.id,
          name: user.name,
          gmail: user.gmail,
          role: user.role
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Register
exports.register = async (req, res, next) => {
  try {
    const { name, gmail, password, sdt, gender, age } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ gmail }, { sdt }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc số điện thoại đã tồn tại"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      gmail,
      password: hashedPassword,
      sdt,
      gender,
      age
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          id: user.id,
          name: user.name,
          gmail: user.gmail,
          role: user.role
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token là bắt buộc"
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ"
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    res.json({
      success: true,
      message: "Token đã được làm mới",
      data: {
        tokens
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ"
      });
    }
    next(error);
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: "Đăng xuất thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, age, gender } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, gender },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại"
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công"
    });
  } catch (error) {
    next(error);
  }
};
