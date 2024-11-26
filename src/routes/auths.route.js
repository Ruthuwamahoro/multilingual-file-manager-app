// const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user.model');
// const auth = require('../middleware/auth.middleware');

// const router = express.Router();

// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const user = new User({ username, email, password });
//     await user.save();

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//     res.status(201).json({ data: token , message: "Successfully registered", status: 200 });
//   } catch (error) {
//     res.status(400).json({ data: null, message: 'Registration failed', error: error.message , status: 400});
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({data: null, message: 'Invalid credentials', status: 401 });
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//     res.status(200).json({data: token, message: "Successfully logged in",  error: null, status: 200 });
//   } catch (error) {
//     res.status(400).json({ message: 'Login failed', error: error.message, data: null, status: 400 });
//   }
// });

// router.get('/profile', auth, async (req, res) => {
//   res.json(req.user);
// });

// module.exports = router;