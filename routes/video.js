const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const router = express.Router();

// ========================
// Configure Cloudinary
// ========================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// ========================
// Multer setup (temporary storage)
// ========================
const upload = multer({ dest: "tmp/" }); // store files temporarily before Cloudinary

// ========================
// Upload video route
// ========================
router.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file received or invalid file type" });
  }

  try {
    // Upload video to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video"
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Return the Cloudinary URL
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Optional: List videos route
// ========================
// If you store video URLs in your database, return them here
router.get("/", async (req, res) => {
  // Example placeholder
  res.json({ message: "Fetch video URLs from your database" });
});

module.exports = router;
