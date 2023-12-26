import fs from "fs";
import express from "express";

import { DELETE_TEMP_FILES_ROUTE, TEMP_FILE_PREFIX } from "../utils/constants";

const router = express.Router();

// Delete all temp files marked with TEMP_FILE_PREFIX
router.delete(DELETE_TEMP_FILES_ROUTE, (req, res) => {
  try {
    fs.readdir("../", (err, files) => {
      files.forEach((file) => {
        if (file.startsWith(TEMP_FILE_PREFIX)) {
          fs.unlinkSync(file);
        }
      });
      res.send({
        message: "Temporary files deleted",
      });
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

export default router;
