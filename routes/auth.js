const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generatePassword = require("../utils/password");

const router = express.Router();

/* TEMP USERS (later DB) */
const users = [];

// --------------------
// TEACHER PASSWORD (ONLY ONE)
// --------------------
let teacherPasswordHash = bcrypt.hashSync("teacher123", 10);

// --------------------
// GET ALL REGISTRATIONS (Teacher Dashboard)
// --------------------
router.get("/registrations", (req, res) => {
  const registrations = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    level: user.level,
    message: user.message || "",
    status: user.status || "pending",
    password: user.plainPassword, // teacher sees it
    date: new Date().toLocaleDateString()
  }));

  res.json({ success: true, registrations });
});

// --------------------
// UPDATE REGISTRATION STATUS
// --------------------
router.post("/update-registration-status", (req, res) => {
  const { id, status } = req.body;

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  user.status = status;
  res.json({ success: true });
});

// --------------------
// DELETE REGISTRATION
// --------------------
router.post("/delete-registration", (req, res) => {
  const { id } = req.body;

  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  users.splice(index, 1);
  res.json({ success: true });
});

// --------------------
// STUDENT LOGIN
// --------------------
router.post("/login-student", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  if (user.status !== "confirmed") {
    return res.status(403).json({
      success: false,
      error: "Account not confirmed by teacher yet"
    });
  }

  const token = jwt.sign(
    { id: user.id, level: user.level },
    "SECRET_KEY",
    { expiresIn: "2h" }
  );

  res.json({ success: true, token, level: user.level });
});

// --------------------
// TEACHER LOGIN
// --------------------
router.post("/login-teacher", (req, res) => {
  const { password } = req.body;

  if (!bcrypt.compareSync(password, teacherPasswordHash)) {
    return res.status(401).json({ success: false, error: "Invalid password" });
  }

  const token = jwt.sign(
    { id: "teacher", role: "teacher" },
    "SECRET_KEY",
    { expiresIn: "2h" }
  );

  res.json({ success: true, token, role: "teacher" });
});

// --------------------
// REGISTER STUDENT
// --------------------
router.post("/register-student", async (req, res) => {
  const { name, email, phone, level, message } = req.body;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "Email already registered"
    });
  }

  const plainPassword = generatePassword(8);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  users.push({
    id: users.length + 1,
    name,
    email,
    phone,
    password: hashedPassword,
    plainPassword, // teacher gives it manually
    level,
    message,
    status: "pending"
  });

  res.json({
    success: true,
    message: "Registration submitted. Teacher will confirm after payment."
  });
});

// --------------------
// CHANGE TEACHER PASSWORD (ONLY)
// --------------------
router.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (!bcrypt.compareSync(currentPassword, teacherPasswordHash)) {
    return res.status(401).json({
      success: false,
      message: "Current teacher password is incorrect"
    });
  }

  teacherPasswordHash = await bcrypt.hash(newPassword, 10);

  res.json({
    success: true,
    message: "Teacher password changed successfully"
  });
  
});

module.exports = router;
