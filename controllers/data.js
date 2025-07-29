const User = require('../models/User');

async function writeUser(req, res) {
  try {
    // Đếm số user hiện tại để tạo id tăng dần
    const count = await User.countDocuments();
    const newUser = new User({
      id: count + 1,
      name: req.body.name,
      age: req.body.age,
      password: req.body.password,
      gmail: req.body.gmail,
      gender: req.body.gender,
      sdt: req.body.sdt
    });

    await newUser.save();
    res.status(201).json({ message: 'User saved to MongoDB', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error saving user', error });
  }
}

async function readUsers(req, res) {
  try {
    const users = await User.find().sort({ id: 1 }); // sắp xếp theo id tăng
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error reading users', error });
  }
}

module.exports = {
  writeUser,
  readUsers
};
