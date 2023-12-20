const express = require("express");
const fs = require("fs");

const {
  DELETE_TEMP_FILES_ROUTE,
  TEMP_FILE_PREFIX,
} = require("../utils/constants");

const router = express.Router();

// Delete all temp files marked with TEMP_FILE_PREFIX
router.delete(DELETE_TEMP_FILES_ROUTE, (req, res) => {
  try {
    fs.readdir("./", (err, files) => {
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

module.exports = router;
