const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auths.route');
const fileRoutes = require('./routes/file.route');
const directoryRoutes = require('./routes/directory.route');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/directories', directoryRoutes);

app.use(
  session({
      secret: process.env.SECRET || "yourDefaultSecret", 
      resave: false,
      saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
