const express = require('express');
const Directory = require('../models/directory.model');
const auth = require('../middleware/auth.middleware');
const File = require('../models/file.model');
const fs = require('fs').promises;

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, parent } = req.body;
    let path = name;

    if (parent) {
      const parentDir = await Directory.findById(parent);
      if (!parentDir) {
        return res.status(404).json({ message: 'Parent directory not found', status: 404, data: null });
      }
      path = `${parentDir.path}/${name}`;
    }

    const existingDirectory = await Directory.findOne({ name, path, owner: req.user._id });
    if (existingDirectory) {
      return res.status(400).json({
        message: 'A directory with this name already exists in the specified path',
        status: 400,
        data: null,
      });
    }

    const directory = new Directory({
      name,
      path,
      owner: req.user._id,
      parent: parent || null,
    });

    await directory.save();
    res.status(200).json({ status: 200, message: 'Successfully created directory', data: directory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A directory with this name already exists in the specified path',
        error: error.message,
        status: 400,
      });
    }

    // General error handling
    console.error('Error creating directory:', error.stack);
    res.status(500).json({ message: 'Directory creation failed', error: error.message, status: 500 });
  }
});



router.get('/', auth, async (req, res) => {
  try {
    const directories = await Directory.find({ owner: req.user._id });

    const directoryWithFiles = await Promise.all(
      directories.map(async (directory) => {
        const files = await File.find({ directory: directory._id }).select('name path size type');
        return {
          ...directory.toObject(),
          files,
        };
      })
    );

    res.status(200).json({
      data: directoryWithFiles,
      message: 'Directories and files successfully retrieved',
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching directories and files',
      error: error.message,
      status: 500,
    });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const directory = await Directory.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!directory) {
      return res.status(404).json({
        message: 'Directory not found',
        status: 404,
        data: null,
      });
    }
    const files = await File.find({ directory: directory._id }).select('name path size type');

    res.status(200).json({
      data: { ...directory.toObject(), files },
      message: 'Directory and files successfully retrieved',
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching directory and files',
      error: error.message,
      status: 500,
    });
  }
});




router.get('/:id/files', auth, async (req, res) => {
  try {
    const directoryId = req.params.id;

    const directory = await Directory.findOne({ _id: directoryId, owner: req.user._id });
    if (!directory) {
      return res.status(404).json({ message: 'Directory not found', status: 404, data: null });
    }

    const files = await File.find({ directory: directoryId, owner: req.user._id });

    res.status(200).json({ 
      message: 'Files retrieved successfully', 
      data: files, 
      status: 200 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error retrieving files in directory', 
      error: error.message, 
      status: 500 
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const directory = await Directory.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name },
      { new: true }
    );

    if (!directory) {
      return res.status(404).json({ message: 'Directory not found', status: 404, data: null });
    }

    res.status(200).json({ status: 200, data: null, message: 'Successfully updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating directory', error: error.message, data: null });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const directory = await Directory.findOne({ _id: req.params.id, owner: req.user._id });

    if (!directory) {
      return res.status(404).json({ message: 'Directory not found', status: 404, data: null });
    }

    const subdirectories = await Directory.find({
      path: { $regex: `^${directory.path}/` },
      owner: req.user._id,
    });

    const files = await File.find({
      directory: { $in: [directory._id, ...subdirectories.map(d => d._id)] },
      owner: req.user._id,
    });

    for (const file of files) {
      await fs.unlink(file.path);
      await File.deleteOne({ _id: file._id });
    }

    await Directory.deleteMany({ _id: { $in: subdirectories.map(d => d._id) } });
    await Directory.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Directory and contents deleted successfully', status: 200, data: null });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting directory', error: error.message, status: 500 });
  }
});

module.exports = router;
