import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database Connected Successfully✅`);
    } catch (error) {
        console.error(` Database connection Error: ${error.message}`);
        process.exit(1);
    }
};