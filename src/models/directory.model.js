const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentDirectory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
    default: null, 
  },
}, {
  timestamps: true,
});

const Directory = mongoose.models.Directory || mongoose.model('Directory', directorySchema);
module.exports = Directory;
