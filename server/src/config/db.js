const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clouddevopshub_leaderboard';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`⚠️ MongoDB connection error: ${error.message}`);
    console.warn(`⚡ Operating in In-Memory / Hybrid storage mode.`);
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
