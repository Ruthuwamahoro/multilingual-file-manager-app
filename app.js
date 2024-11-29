const express = require('express');
const passport = require('passport');
const { i18next, middleware } = require('./src/config/i18next.js');
const session = require('express-session');
const Queue = require('bull');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.route.js');
const fileRoutes = require('./src/routes/file.route.js');
const directoryRoutes = require('./src/routes/directory.route.js');
const connectDB = require('./src/config/db.js');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const cors = require('cors');

const app = express();
const Port = process.env.PORT || 5000;

const fileUploadQueue = new Queue('file-uploads', {
  redis: { host: 'localhost', port: 6379 }
});

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullAdapter(fileUploadQueue)],
  serverAdapter: serverAdapter
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(middleware.handle(i18next));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/directories', directoryRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 500, message: err.message, data: null });
});

connectDB();
app.listen(Port, () => console.log(`App listening on port ${Port}`));

module.exports = app