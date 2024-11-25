import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.js";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
// import home from "./routes/home.js";

dotenv.config();

const app = express();
app.set("views", "./src/views/");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SECRET || "yourDefaultSecret", 
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use(express.json()); 
app.use("/api/auth", userRouter);
// app.use("/", home);

export default app;
