const mongoose = require('mongoose');
const {v4: uuidV4} = require('uuid');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String },
  telephone: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema );