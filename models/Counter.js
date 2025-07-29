const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // tên collection cần đếm
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model('Counter', counterSchema);
