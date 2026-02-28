const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("../passport");

const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const app = express();

const isProd = process.env.NODE_ENV === "production";

// If deployed behind a reverse proxy (e.g., Render/Heroku/Nginx), secure cookies require trust proxy.
if (isProd) app.set("trust proxy", 1);

// CORS Setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

// Prevent excessively large JSON payloads (AI prompts/code can otherwise be abused).
app.use(express.json({ limit: "1mb" }));

// Session Setup
app.use(
  session({
    // Never use a predictable default secret in production.
    secret: isProd
      ? process.env.SESSION_SECRET
      : process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

if (isProd && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

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
