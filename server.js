if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

import flash from "express-flash";
import app from "./src/app.js"
import dotenv from "dotenv";
import passport from "passport";
import bcrypt from "bcrypt";
import session from "express-session";
dotenv.config()
const Port = process.env.PORT || 5000;


// Passport js
const initializePassport = require("./passport-config");
initializePassport(passport, email=>{
    return users.find(user => user.email === email)
})

const users = []

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session())

app.get('/login', (req, res) =>{
    res.render('login.ejs');
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
}))

app.listen((Port, () => {
    console.log("This app is listening on port", Port)
}))