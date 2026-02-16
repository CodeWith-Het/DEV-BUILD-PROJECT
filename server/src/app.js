const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport"); 
require("../passport"); 

const authRoutes = require("./routes/auth"); 
const app = express();

// CORS Setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

app.use(express.json());

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Google Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  },
);

// GitHub Routes
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  },
);

// User Data Route
app.get("/api/user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not Authenticated" });
  }
});

// Logout Route
app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173/login");
  });
});

module.exports = app;
