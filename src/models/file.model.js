const mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  path: {
    type: String,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  directory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
    required: true 
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const File = mongoose.models.File || mongoose.model('File', fileSchema);
module.exports = File;
