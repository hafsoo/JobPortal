const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') return; // skip in test mode
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected with server: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

module.exports = connectDB;