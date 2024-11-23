const User = require('../models/user');
const express = require('express');
const router = express.Router();
require('dotenv').config();
const { registerSchema, options } = require('../utils/validate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;




router.post("/", async(req, res) => {
    try{

        const result = registerSchema.validate(req.body, options);
        if (result.error) {
            const messageError = result.error.details.map((error) => error.message).join(', ');
            return res.status(400).json({ status: 400, error: messageError });
        }
        const { fullName, email, gender, telephone, password} = await req.body()
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
    
        const saveUser = new User({
            fullName,
            email,
            gender,
            telephone,
            password: hash
        })
        await saveUser.save()
        res.json({ status: 200, message: "User registered successfully", data: null });
    } catch(err){
        res.json({status:500, message: "Unexpected error occurred", data: error.message})
    }

})


async function validateUser(email, password, done) {
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}

passport.use(new LocalStrategy(validateUser));


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 400, error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 400, error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ status: 400, error: "Invalid email or password" });
        }

        const tokenPayload = { email: user.email, role: 'user' };
        const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.header('Authorization', `Bearer ${token}`);
        res.json({ status: 200, message: "Login successful", token });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
module.exports = router;