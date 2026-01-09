require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/video");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/video", videoRoutes);

// ⚠️ RENDER NEEDS process.env.PORT
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
