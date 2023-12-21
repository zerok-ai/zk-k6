const express = require("express");
const pkill = require("pkill");
const serviceManager = require("../configs/serviceManager.js");
const controlManager = require("../configs/k6ControlManager.js");
const fs = require("fs");
const {
  pauseK6,
  resumeK6,
  scaleK6,
  status,
} = require("../utils/k6ControlFunctions.js");
const router = express.Router();

let running = false;
let paused = false;

console.log(controlManager.isK6Running());

/* 
    Pauses k6 process
*/
router.get("/pause", async (req, res) => {
  try {
    return res.send(await controlManager.pauseTests());
  } catch (error) {
    return res.status(500).send({
      err: error,
    });
  }
});

// Resume k6 process
router.get("/resume", async (req, res) => {
  try {
    return res.send(await controlManager.resumeTests());
  } catch (error) {
    return res.send(error);
  }
});

// Reset k6 process

router.get("/reset", (req, res) => {
  serviceManager.markAllAsPaused();
  pkill.full("k6");
  fs.readdir("./", (err, files) => {
    files.forEach((file) => {
      if (file.startsWith("lastrun-")) {
        fs.unlinkSync(file);
      }
    });
    res.send({
      message: "Reset done, last run files deleted",
    });
  });
});

router.get("/mark-closed/:service", (req, res) => {
  const service = req.params.service;
  serviceManager.markRunning(service, false);
  res.send("Marked for service " + service);
});

router.get("/scale", (req, res) => {
  const queryParams = req.query;
  const newVUs = queryParams.vus;

  if (!newVUs || newVUs === 0) {
    res.status(400).send({
      message: "Invalid inputs",
    });
    return;
  }

  if (!running) {
    res.send({
      message: "No tests are running. Nothing to scale!",
    });
    return;
  }
  try {
    scaleK6(newVUs);
    res.send({
      message: `Scaled to ${newVUs} VUs`,
    });
  } catch (error) {
    res.status(500).send({
      err: error,
    });
    return;
  }
});

router.get("/status/:service", (req, res) => {
  const service = req.params.service;
  const scenario = req.query.scenario;
  console.log("status/service - " + service);
  const isScenarioValid = serviceManager.isValidScenario(service, scenario);
  if (!isScenarioValid) {
    res.status(400).send({
      message: "Invalid service",
    });
    return;
  }

  status(service, (data) => res.send(data.toString()));
});

module.exports = router;
