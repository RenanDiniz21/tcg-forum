const mongoose = require('mongoose');

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI nao configurada');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado');
}

module.exports = connectDB;
