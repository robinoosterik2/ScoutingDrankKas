import mongoose from "mongoose";

let mongooseClient = null;

async function connectDB(uri) {
  if (mongooseClient) {
    return mongooseClient;
  }
  try {
    mongooseClient = await mongoose.connect(uri);
    console.log("MongoDB connection established (centralized).");
    return mongooseClient;
  } catch (error) {
    console.error("Error connecting to MongoDB (centralized):", error);
    mongooseClient = null;
    throw error;
  }
}

async function disconnectDB() {
  if (mongooseClient) {
    await mongooseClient.disconnect();
    mongooseClient = null;
    console.log("MongoDB connection closed (centralized).");
  }
}

function getMongooseClient() {
  return mongooseClient;
}

export { connectDB, disconnectDB, getMongooseClient };
