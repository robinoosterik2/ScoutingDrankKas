// utils/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables with fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://drankkas:drankkas@localhost:27017/drankkas_db';
    
    console.log("Connecting to MongoDB:", mongoUri);
    
    await mongoose.connect(mongoUri, {
      // Connection options if needed
    });
    
    console.log("Successfully connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // For production, you might want to exit the process on connection failure
    if (process.env.NODE_ENV === 'production') {
      console.error("Exiting due to MongoDB connection failure");
      process.exit(1);
    }
    throw error;
  }
};

// Connect to MongoDB when this module is imported
connectDB();

export default connectDB;
