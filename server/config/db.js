import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Replace the password placeholder in the connection string
const getMongoURI = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MongoDB URI is not defined in environment variables');
  }
  
  // Replace the placeholder with the actual password if needed
  if (uri.includes('<db_password>')) {
    const password = process.env.DB_PASSWORD;
    if (!password) {
      throw new Error('DB_PASSWORD is not defined in environment variables');
    }
    return uri.replace('<db_password>', password);
  }
  
  return uri;
};

const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB; 