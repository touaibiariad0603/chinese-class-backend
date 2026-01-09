require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");

console.log("Loading auth routes...");
const authRoutes = require("./routes/auth");
console.log("Auth routes loaded:", typeof authRoutes);

console.log("Loading video routes...");
const videoRoutes = require("./routes/video");
console.log("Video routes loaded:", typeof videoRoutes);

const app = express();

app.use(cors());
app.use(express.json());

console.log("Setting up routes...");

// Check if routes are valid before using them
if (typeof authRoutes !== 'function') {
  console.error("ERROR: authRoutes is not a function, it is:", typeof authRoutes);
  process.exit(1);
}

if (typeof videoRoutes !== 'function') {
  console.error("ERROR: videoRoutes is not a function, it is:", typeof videoRoutes);
  process.exit(1);
}

app.use("/api", authRoutes);
app.use("/api/video", videoRoutes);

// ⚠️ RENDER NEEDS process.env.PORT
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});