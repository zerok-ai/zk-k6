import multer from "multer";
import path from "path";
const { TEMP_FILE_PREFIX } = require("./constants");

// not used right now
const storage = multer.diskStorage({
  destination: "../",
  filename: function (req, file, callback) {
    // Generate a custom filename
    const uniquePrefix = TEMP_FILE_PREFIX;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const fileName =
      uniquePrefix + file.fieldname + "-" + uniqueSuffix + fileExtension;
    callback(null, fileName);
  },
});
const upload = multer({ storage });
export default upload;
