const mongoose = require("mongoose");
require('dotenv').config()

const connectDB = async () => {
  try {
    // Connect to the MongoDB Atlas cluster
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;