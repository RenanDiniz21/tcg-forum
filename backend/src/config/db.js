const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI nao configurada');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');
}

module.exports = connectDB;
