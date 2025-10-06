const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });