import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from './routes/user';


dotenv.config()
const app = express();


connectDB();

app.use("/users", router)

export default app;