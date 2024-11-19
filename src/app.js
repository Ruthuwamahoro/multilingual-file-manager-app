import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
dotenv.config()
const app = express();
connectDB()
export default app;