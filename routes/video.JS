const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "video/mp4") {
      return cb(new Error("Only MP4 allowed"));
    }
    cb(null, true);
  }
});

// ✅ UPLOAD VIDEO
router.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file received or invalid file type (MP4 only)"
    });
  }

  res.json({
    filename: req.file.filename
  });
});


// ✅ STREAM VIDEO
router.get("/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = Number(parts[0]);
  const end = parts[1] ? Number(parts[1]) : fileSize - 1;

  const chunkSize = end - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
    "Cache-Control": "no-cache",
  });

  fs.createReadStream(filePath, { start, end }).pipe(res);
});



module.exports = router;
