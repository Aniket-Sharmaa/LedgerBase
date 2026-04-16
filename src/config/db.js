// src/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()
export function connectDB() {
    mongoose.connect(process.env.MONGO_URI).then(()=> {
        console.log("Connected to MongoDB");
    }).catch((err)=> {
        console.error("Error connecting to MongoDB:", err)
        process.exit(1);
    })
}