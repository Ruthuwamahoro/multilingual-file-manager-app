// import express, { Router } from "express";
// import dotenv from "dotenv";
// import { connectDB } from "./config/db.js";
// import  routerValue  from "./routes/file.route.js";
// import path from "path";
// dotenv.config()
// const app = express();
// app.use(express.json())
// app.use("/api/files", routerValue)
// connectDB()
// export default app;
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.route');
const fileRoutes = require('./routes/file.route');
const directoryRoutes = require('./routes/directory.route');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/directories', directoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});