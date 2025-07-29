const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  age: Number,
  password: { type: String, required: true },
  gmail: { type: String, unique: true, required: true },
  gender: String,
  sdt: { type: String, unique: true, required: true },
  role: { type: String, enum: ['user', 'admin'], default: "user" }
}, {
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.password;
    }
  }
});

userSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model("User", userSchema);
