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
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();


app.use(cors({ methods: ["GET", "POST", "OPTIONS"], credentials: true }));


i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./src/locales/{{lng}}/translation.json", 
    },
    detection: {
      order: ["querystring", "cookie", "header", "session"],
      caches: ["cookie"], 
    },
  });


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(middleware.handle(i18next));


app.use(
  session({
    secret: process.env.SECRET || "yourDefaultSecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Connect to MongoDB
connectDB();

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());




app.use("/api/auth", userRouter);


app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ status: 500, error: "Internal Server Error" });
});



export default app;
