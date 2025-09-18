const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connectionDB = await mongoose.connect(process.env.MONGO_DB_URL);

    console.log(`✅ MongoDB Connected: ${connectionDB.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process if DB fails
  }
};

module.exports = connectDb;
