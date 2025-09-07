import express from "express";
import { upload } from "../middleware/uploadmiddleware.js";

const uploadRouter = express.Router();

// Upload profile picture
uploadRouter
.post("/profile", upload.single("profilePic"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded ⚠️" });
  }
  res.status(200).json({
    message: "Profile picture uploaded successfully ✅",
    filePath: `/uploads/${req.file.filename}`, // URL to access file
  });
});

// Upload product images (multiple files)
uploadRouter
.post("/product", upload.array("productImages", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded ⚠️" });
  }
  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
  res.status(200).json({
    message: "Product images uploaded successfully ✅",
    files: filePaths,
  });
});


export default uploadRouter;
