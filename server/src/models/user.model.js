const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,  <-- ISSE HATA DE YA COMMENT KAR DE
    },
    googleId: { type: String }, // Google walon ke liye
    githubId: { type: String }, // GitHub walon ke liye
    username: { type: String }, // Naam store karne ke liye
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
