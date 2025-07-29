const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format lỗi thành dạng dễ đọc
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,  
        message: err.msg     
      }))
    });
  }
  next(); // Nếu không có lỗi, cho phép request đi tiếp
};

module.exports = validate;
