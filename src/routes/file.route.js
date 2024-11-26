const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const File = require('../models/file.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { directory } = req.body;

    const existingFile = await File.findOne({
      name: req.file.originalname,
      directory: directory || null,
      owner: req.user._id,
    });

    if (existingFile) {
      return res.status(400).json({
        message: 'A file with this name already exists in the specified directory',
        status: 400,
        data: null,
      });
    }

    const file = new File({
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      owner: req.user._id,
      directory: directory || null,
    });

    await file.save();
    res.status(201).json({ status: 201, message: 'File uploaded successfully', data: file });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message, status: 500 });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
    }).populate('directory');
    console.log("this is fantastics files", files)
    res.status(200).json({status: 200, messsage: "Files retrieved successfully", data: files});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error: error.message, data: null });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found', data: null, status: 404 });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching file', error: error.message, data: null });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    
    if (!file) {
      return res.status(404).json({ message: 'File not found', data: null, status: 404 });
    }
    
    await File.deleteOne({ _id: file._id });

    res.json({ message: 'File deleted successfully', status: 200, data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message, status: 500 });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ message: 'File not found', data: null, status: 404 });
    }

    if (!file.sharedWith.includes(userId)) {
      file.sharedWith.push(userId);
      await file.save();
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error sharing file', error: error.message, status: 500 });
  }
});

module.exports = router;
