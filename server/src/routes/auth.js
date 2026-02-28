const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.model");

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      email,
      password,
      username: username || email.split("@")[0],
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    if (user.password !== password)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Create a Passport session so `req.user` is available on subsequent requests.
    // This is required for routes protected by [`requireAuth()`](DEV-BUILD-PROJECT/server/src/routes/ai.js:5).
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });

      // Ensure session is persisted before responding (avoids race where Set-Cookie is not sent).
      req.session.save(() => {
        return res.status(200).json({
          message: "Login Successful",
          user: { _id: user._id, email: user.email, username: user.username },
        });
      });
    });

    return;
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
