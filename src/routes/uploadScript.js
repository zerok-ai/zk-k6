const express = require("express");
const router = express.Router();
const path = require("path");

const upload = require("../utils/storage.js");
router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const absolutePath = path.resolve(file.path);
  res.send({
    message: "File uploaded successfully",
    path: absolutePath,
  });
});

router.post("/start/:service", upload.single("file"), (req, res) => {
  const file = req.file;
  const absolutePath = path.resolve(file.path);
  const service = req.params.service;
  const queryParams = req.query;
  const initialVUs = queryParams.vus ? queryParams.vus : 1000;
  const maxVUs = queryParams.mvus ? queryParams.mvus : 1000;
  const rate = queryParams.rate ? queryParams.rate : 220;
  const stages = queryParams.stages ? queryParams.stages : "1_300-1_400";
  const duration = queryParams.duration ? queryParams.duration : "5m";
  const timeunit = queryParams.timeunit ? queryParams.timeunit : "1m";
  const concurrency = queryParams.concurrency ? queryParams.concurrency : "";
  const testTag = queryParams.tag ? queryParams.tag : "none";
  const k6ScriptFilePath = absolutePath;
  console.log("k6ScriptFilePath=", k6ScriptFilePath);
  runTestForService(
    {
      service,
      initialVUs,
      maxVUs,
      rate,
      stages,
      duration,
      timeunit,
      concurrency,
      testTag,
      k6ScriptFilePath,
    },
    (data) => {
      res.send(data);
    }
  );
});

module.exports = router;
