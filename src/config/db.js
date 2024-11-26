const mongoose = require("mongoose");
require("dotenv").config()

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not defined');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });
    console.log('MongoDB is successfully connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.log('OOps! MongoDB disconnected...');
  });
};

module.exports = connectDB