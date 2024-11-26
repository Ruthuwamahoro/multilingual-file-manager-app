const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: "Invalid email" });
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return done(null, false, { message: "Invalid password" });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

router.post("/signup", async (req, res) => {
    try {
        const { username, email, gender, telephone, password } = req.body;

        if (!username || !email || !gender || !telephone || !password) {
            return res.json({ status: 400, error: "All fields are required" });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const saveUser = new User({
            username,
            email,
            gender,
            telephone,
            password: hash,
        });
        await saveUser.save();
        res.status(200).json({ status: 200, message: "Sign Up successful", data: null });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ status: 500, error: `Error registering user. ${error.message}`, data: null });
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(400).json({ status: 400, error: info.message });
        }
        const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.status(200).json({ status: 200, message: "Login successful", data: token });
    })(req, res, next);
});

module.exports = router
