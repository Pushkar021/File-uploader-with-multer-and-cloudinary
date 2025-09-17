import multer from "multer";
import express from "express";
import fs from "fs";
import { uploadoncld } from "./cloudnary.js";
import { error } from "console";

const app = express();

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Math.round(Math.random() * 10) + "-" + file.originalname);
  },
});

// File filter
const filefilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("File type not allowed!"), false);
  } else {
    cb(null, true);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter: filefilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    console.log("File saved locally:", req.file.path);

    const cloudinaryUrl = await uploadoncld(
      req.file.path,
      req.file.originalname
    );

    if (!cloudinaryUrl) {
      return res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }

    res.json({
      message: "File uploaded successfully!",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      cloudinaryUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

app.use((error,req,res,next)=>{
  return res.status(500).json({
    message:"something up with file upload!!"
  })
})

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
