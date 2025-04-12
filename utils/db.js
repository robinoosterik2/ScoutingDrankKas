// utils/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI, 'process.env.MONGODB_URI')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017', {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};
connectDB();
export default connectDB;
