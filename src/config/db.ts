import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        
        mongoose.connection.on('connected', () => {
            console.log("Database connected Successfully");
        })
        mongoose.connection.on('error',(error) => {
            console.log("Error in Connecting Database", error);
        })
         await mongoose.connect(config.databaseUrl as string);
    } catch (error) {
        console.error("Failed to connect to database",error);
        process.exit(1);
    }
  
}

export default connectDB;