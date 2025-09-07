import multer from "multer";
import path from "path";
import fs from "fs";

function getFolderByItsMimeType(mimeType) {
  if (mimeType.startsWith("image/")) return "uploads/images";
  if (mimeType === "application/pdf") return "uploads/pdfs";
  if (mimeType.includes("msword")) return "uploads/docs";
  if (mimeType.includes("spreadsheetml")) return "uploads/excels";
  if (mimeType === "application/zip") return "uploads/zips";
  return "uploads/others";
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = getFolderByItsMimeType(file.mimetype);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({ storage });

export default upload;

