const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  // Close mongoose connection
  await mongoose.connection.close();
});

module.exports = {};
