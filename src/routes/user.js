import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// Render Signup Page
router.get("/signup", (req, res) => {
    res.render("signup", { error: null });
});

// Render Login Page
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// Handle Signup Form Submission
// Handle Signup Form Submission
// Handle Signup Form Submission
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, gender, telephone, password } = req.body;

        // Log the received data to inspect
        console.log("Received data:", { fullName, email, gender, telephone, password });

        // Validate that all fields are provided
        if (!fullName || !email || !gender || !telephone || !password) {
            return res.json({ status: 400, error: "All fields are required" });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const saveUser = new User({
            fullName,
            email,
            gender,
            telephone,
            password: hash,
        });
        await saveUser.save();

        res.json({ status: 200, message: 'Sign Up successful' });

    } catch (error) {
        console.error("Error during signup:", error);
        res.json({ status: 500, error: `Error registering user. ${error.message}` });
    }
});


// Handle Login Form Submission
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render("login", { error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.redirect("/dashboard"); // Change this to your dashboard route
    } catch (error) {
        res.render("login", { error: "An unexpected error occurred. Please try again." });
    }
});

export default router;
