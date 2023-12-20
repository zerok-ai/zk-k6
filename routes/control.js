const express = require("express");
const pkill = require("pkill");
const { ServiceManager } = require("../configs/serviceManager.js");
const serviceManager = new ServiceManager();
const fs = require("fs");
const {
  pauseK6,
  resumeK6,
  scaleK6,
  status,
} = require("../utils/k6ControlFunctions");
const router = express.Router();

let running = false;
let paused = false;

/* 
    Pauses k6 process
*/
router.get("/pause", (req, res) => {
  if (!running) {
    res.send({
      message: "No tests are running. Nothing to pause!",
    });
    return;
  }
  if (paused) {
    res.send({
      message: "K6 is already paused",
    });
    return;
  }
  paused = true;
  try {
    pauseK6();
    res.send({
      message: "K6 paused",
    });
  } catch (error) {
    paused = false;
    res.status(500).send({
      err: error,
    });
    return;
  }
});

// Resume k6 process
router.get("/resume", (req, res) => {
  if (!running) {
    res.send("No tests are running. Nothing to resume!");
    return;
  }
  if (!paused && running) {
    res.send("Already running");
    return;
  }
  paused = false;
  try {
    resumeK6();
    res.send("Resumed");
  } catch (error) {
    paused = false;
    res.send(error);
    return;
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
  console.log("status/service - " + service);
  const isServiceValid = serviceManager.isValid(service);
  if (!isServiceValid) {
    res.status(400).send({
      message: "Invalid service",
    });
    return;
  }

  status(service, (data) => res.send(data.toString()));
});

module.exports = router;
