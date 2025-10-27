const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gasguard';

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Falling back to in-memory storage (data will not persist)');
  }
}

module.exports = { connectDB, mongoose };
