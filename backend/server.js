const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require("dotenv").config({ path: "./config/.env" });
const connectDB = require('./db/Database');
const path = require('path');


connectDB();

const app = express();
//app.use(cors(
  //  {
    //origin: "http://localhost:5173",
    //credentials: true,
  //}
//));

const allowedOrigins = [
  "http://localhost:5173",     // local dev
  "http://localhost:80",       // docker local
  "http://localhost",          // docker (port 80 default)
  //process.env.FRONTEND_URL,    // production ke liye
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Postman / server-to-server (no origin) allow karo
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(__dirname, 'uploads')));
//app.use('/uploads', express.static('uploads'));
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/jobs',         require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;