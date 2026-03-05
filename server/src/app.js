const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const aiRoutes = require("./routes/ai"); // ✅ Import sirf ek baar
require("../passport");

const authRoutes = require("./routes/auth");
const app = express();

const isProd = process.env.NODE_ENV === "production";

// Trust proxy for secure cookies in production (Render/Heroku/Nginx)
if (isProd) app.set("trust proxy", 1);

// 1. CORS Setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

// 2. Body Parser (Important for AI code payloads)
app.use(express.json({ limit: "1mb" }));

// 3. Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
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

// 4. Passport Init
app.use(passport.initialize());
app.use(passport.session());

// 5. Routes Definition
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); // ✅ AI routes mounted at /api/ai

// 6. Google Auth Routes
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

// 7. GitHub Auth Routes
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

// 8. User Info & Session Routes
app.get("/api/user", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not Authenticated" });
  }
});

app.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:5173/login");
  });
});

module.exports = app;
