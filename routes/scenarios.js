const express = require("express");
const fs = require("fs");
const path = require("path");
const { getContentType } = require("../utils/functions");
const app = express();
const router = express.Router();

const FOLDER_TO_SERVE = path.join(__dirname, "../runs");

// Define a route to handle incoming requests
router.get("/list/:scenario", (req, res) => {
  const scenario = req.params.scenario;
  // Construct the file path
  const filePath = path.join(FOLDER_TO_SERVE, scenario);
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: "Scenario not found" });
    } else {
      //Get files in folder path present here filePath
      fs.readdir(filePath, (err, files) => {
        if (err) {
          res.status(500).json({ error: "Internal server error" });
        } else {
          res.send(files);
        }
      });
    }
  });
});

// Define a route to handle incoming requests
router.get("/fetch/:scenario/:run", (req, res) => {
  const scenario = req.params.scenario;
  const runFileName = req.params.run;

  // Construct the file path
  const filePath = path.join(FOLDER_TO_SERVE, scenario);
  const runFilePath = path.join(filePath, runFileName);

  // Check if the file exists
  fs.access(runFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: "File not found" });
    } else {
      // Read and serve the file
      fs.readFile(runFilePath, (err, data) => {
        if (err) {
          res.status(500).json({ error: "Internal server error" });
        } else {
          // Set the appropriate Content-Type header based on the file's extension
          const ext = path.extname(runFileName).toLowerCase();
          const contentType = getContentType(ext);
          res.set("Content-Type", contentType);
          res.send(data);
        }
      });
    }
  });
});

module.exports = router;
