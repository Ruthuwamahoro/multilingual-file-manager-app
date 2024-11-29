const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const Queue = require('bull');
const File = require('../models/file.model');
const auth = require('../middleware/auth.middleware');
const { i18next } = require('../config/i18next');
const setLanguageMiddleware = require("../utils/setLanguage")
const cloudinary = require("../utils/cloudinary")



const router = express.Router();
router.use(setLanguageMiddleware)


const fileUploadQueue = new Queue('file-uploads', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

fileUploadQueue.process(async (job) => {
  const { file, userId, directory } = job.data;

  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(file.path, {
      folder: directory || 'uploads',
    });

    const newFile = new File({
      name: file.originalname,
      path: cloudinaryResponse.secure_url,
      size: file.size,
      type: file.mimetype,
      owner: userId,
      directory: directory || null,
    });

    await newFile.save();
    return { success: true, fileId: newFile._id };
  } catch (error) {
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.error('Failed to delete file:', unlinkError);
    }
    throw new Error(`File upload to Cloudinary failed: ${error.message}`);
  }
});


router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: i18next.t('file.upload.no_file', { lng: req.language || 'en' }),
        status: 400,
        data: null,
      });
    }

    const { originalname, path, size, mimetype } = req.file;
    const { directory } = req.body;
    const lng = req.language || 'en';


    const cloudinaryResponse = await cloudinary.uploader.upload(path, {
      folder: directory || 'uploads',
    });
    const existingFile = await File.findOne({
      name: originalname,
      path: cloudinaryResponse.secure_url,
      size,
      type: mimetype,
      directory: directory || null,
      owner: req.user._id,
    });

    if (existingFile) {
      return res.status(400).json({
        message: i18next.t('file.upload.duplicate', { lng }),
        status: 400,
        data: null,
      });
    }

    const newFile = new File({
      name: originalname,
      path: cloudinaryResponse.secure_url,
      size,
      type: mimetype,
      owner: req.user._id,
      directory,
    });

    await newFile.save();

    res.status(201).json({
      message: i18next.t('file.upload.success', { lng }),
      fileId: newFile._id,
      status: 201,
      data: newFile,
    });
  } catch (error) {
    res.status(500).json({
      message: i18next.t('file.upload.error', { lng: req.language || 'en', error: error.message }),
      error: error.message,
      status: 500,
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const lng = req.language || 'en';
    const files = await File.find({
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
    }).populate('directory');

    res.status(200).json({
      status: 200, 
      message: i18next.t('file.list.success', { lng }), 
      data: files
    });
  } catch (error) {
    res.status(500).json({ 
      message: i18next.t('file.list.error', { 
        lng: req.language || 'en', 
        error: error.message 
      }), 
      error: error.message, 
      data: null 
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const lng = req.language || 'en';
    const file = await File.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { sharedWith: req.user._id }],
    });

    if (!file) {
      return res.status(404).json({ 
        message: i18next.t('file.list.not_found', { lng }), 
        data: null, 
        status: 404 
      });
    }

    res.status(200).json({status:200, data: file, message: i18next.t('file.list.success', { lng })});
  } catch (error) {
    res.status(500).json({ 
      message: i18next.t('file.fetch.error', { 
        lng: req.language || 'en', 
        error: error.message 
      }), 
      error: error.message, 
      data: null 
    });
  }
});

router.patch('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: i18next.t('file.update.no_file', { lng: req.language || 'en' }),
        status: 400,
        data: null,
      });
    }

    const { originalname, path, size, mimetype } = req.file;
    const { directory } = req.body;
    const lng = req.language || 'en';

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        message: i18next.t('file.update.not_found', { lng }),
        status: 404,
        data: null,
      });
    }

    try {
      await fs.unlink(file.path); 
    } catch (error) {
      return error
    }

    const job = await fileUploadQueue.add({
      file: {
        originalname,
        path,
        size,
        mimetype,
      },
      userId: req.user._id,
      directory,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    file.name = originalname;
    file.path = path;
    file.size = size;
    file.type = mimetype;
    file.directory = directory || file.directory;

    await file.save();

    res.status(202).json({
      message: i18next.t('file.update.queued', { lng }),
      jobId: job.id,
      status: 202,
    });
  } catch (error) {
    res.status(500).json({
      message: i18next.t('file.update.error', {
        lng: req.language || 'en',
        error: error.message,
      }),
      error: error.message,
      status: 500,
    });
  }
});



router.delete('/:id', auth, async (req, res) => {
  try {
    const lng = req.language || 'en';
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ 
        message: i18next.t('file.delete.not_found', { lng }), 
        data: null, 
        status: 404 
      });
    }
    
    await File.deleteOne({ _id: file._id });

    res.json({ 
      message: i18next.t('file.delete.success', { lng }), 
      status: 200, 
      data: null 
    });
  } catch (error) {
    res.status(500).json({ 
      message: i18next.t('file.delete.error', { 
        lng: req.language || 'en', 
        error: error.message 
      }), 
      error: error.message, 
      status: 500 
    });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const lng = req.language || 'en';
    const { userId } = req.body;
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
      return res.status(404).json({ 
        message: i18next.t('file.not_found', { lng }), 
        data: null, 
        status: 404 
      });
    }

    if (!file.sharedWith.includes(userId)) {
      file.sharedWith.push(userId);
      await file.save();
    }

    res.json({
      message: i18next.t('file.share.success', { lng }),
      file 
    });
  } catch (error) {
    res.status(500).json({ 
      message: i18next.t('file.share.error', { 
        lng: req.language || 'en', 
        error: error.message 
      }), 
      error: error.message, 
      status: 500 
    });
  }
});

module.exports = router;