const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/video");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // REQUIRED for req.body

// Routes
app.use("/api", authRoutes);
app.use("/api/video", videoRoutes);

// Port from .env or fallback
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
