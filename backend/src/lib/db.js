import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI
    if (!mongoURI) {
      throw new Error("Please provide the MONGO_URI in the env.")
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.log("MongoDB connection error", error.message)
    process.exit(1)
    // 1 means failed, 0 means success
  }
}

export default connectDB;