import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/user.js";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import cors from "cors";
import middleware from "i18next-http-middleware";

const app = express();

dotenv.config();

app.use(cors({ methods: ["GET", "POST", "OPTIONS"] }));
app.use(cors());



i18next.use(Backend).use(middleware.LanguageDetector).init({
    fallbackLng: 'en',
    backend: {
        loadPath: "./locales/{{lng}}/translation.json",
    }
});




app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(middleware.handle(i18next));

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


app.use("/api/auth", userRouter);


export default app;
