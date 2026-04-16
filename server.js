// server.js

import app from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
dotenv.config();

connectDB();
app.listen(3001, () => {
    console.log("Server is running on port 3001");
})