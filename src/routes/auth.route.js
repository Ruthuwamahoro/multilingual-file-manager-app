const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { i18next } = require("../config/i18next");
const setLanguageMiddleware = require("../utils/setLanguage")
require("dotenv").config();

const router = express.Router();
router.use(setLanguageMiddleware)

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, {
            message: i18next.t("common.error.invalid_email"),
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, {
            message: i18next.t("common.error.invalid_password"),
          });
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
  const { username, email, gender, telephone, password } = req.body;

  if (!username || !email || !gender || !telephone || !password) {
    return res.status(400).json({
      status: 400,
      message: i18next.t("common.error.missing_fields", { lng: req.language || "en" }),
      data: null,
    });
  }

  try {
    const [existingUsername, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (existingUsername) {
      return res.status(400).json({
        status: 400,
        message: i18next.t("auth.register.username_taken", { lng: req.language || "en" }),
        data: null,
      });
    }

    if (existingEmail) {
      return res.status(400).json({
        status: 400,
        message: i18next.t("auth.register.email_registered", { lng: req.language || "en" }),
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      gender,
      telephone,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      status: 201,
      message: i18next.t("auth.register.success", { lng: req.language || "en" }),
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: i18next.t("auth.register.error", { lng: req.language || "en" }),
      data: null,
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: info.message,
        data: null,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    return res.status(200).json({
      status: 200,
      message: i18next.t("auth.login.success", { lng: req.language || "en" }),
      data: token,
    });
  })(req, res, next);
});

module.exports = router;
