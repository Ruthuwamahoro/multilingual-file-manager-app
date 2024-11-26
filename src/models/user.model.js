const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true,
    trim: true, }, 
  email: { type: String, required: true, unique: true, trim: true,
    lowercase: true,},
  gender: { type: String, required: true },
  telephone: { type: String, required: true },
  password: { type: String, required: true,     minlength: 8, },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
