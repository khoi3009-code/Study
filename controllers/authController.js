const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body;

    const user = await User.findOne({ gmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
