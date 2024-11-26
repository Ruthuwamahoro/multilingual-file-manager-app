const express = require('express');
const passport = require("passport");
require('dotenv').config();

const authRoutes = require('./src/routes/auth.route.js');
const fileRoutes = require('./src/routes/file.route.js');
const directoryRoutes = require('./src/routes/directory.route.js');
const connectDB  = require("./src/config/db.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/directories', directoryRoutes);
const cors = require("cors");
app.use(cors());


app.use(passport.initialize());
app.use(passport.session());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
connectDB()

const Port = process.env.PORT || 5000

console.log("this is the PORT", )

app.listen(Port, () => {
  console.log("This app is listening on port", Port)
})
