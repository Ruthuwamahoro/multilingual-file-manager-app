import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.js";
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.set("views", "./src/views/")
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();


app.use(express.json()); // Middleware to parse JSON
app.use("/users", userRouter);

export default app;
