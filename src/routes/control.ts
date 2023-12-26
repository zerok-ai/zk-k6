import express, { Request, Response } from "express";
const pkill = require("pkill");
import controlManager from "configs/k6ControlManager";
import serviceManager from "configs/serviceManager";
import { ServiceNameType } from "utils/types";
import { scenarioCheck } from "utils/middleware";

const fs = require("fs");
const { scaleK6, status } = require("../utils/k6ControlFunctions.js");
const router = express.Router();

let running = false;
let paused = false;

console.log(controlManager.isK6Running());

/* 
    Pauses k6 process
*/
router.get("/:service/:scenario/pause", scenarioCheck, async (req, res) => {
  try {
    const service = req.params.service as ServiceNameType;
    const scenario = req.params.scenario;
    if (!serviceManager.isRunning(service, scenario)) {
      return res.status(400).send({
        message: "Scenario is not running",
      });
    }
    const status = await controlManager.pauseTests();
    if (status.status === 200) {
      serviceManager.addPaused(service, scenario);
    }
    return res.send(status);
  } catch (error) {
    return res.status(500).send({
      err: error,
    });
  }
});

// Resume k6 process
router.get("/:service/:scenario/resume", async (req, res) => {
  try {
    const service = req.params.service as ServiceNameType;
    const scenario = req.params.scenario;
    const status = await controlManager.resumeTests();
    if (status.status === 200) {
      serviceManager.addRunning(service, scenario);
    }
    return res.send(status);
  } catch (error) {
    return res.send(error);
  }
});

// Reset k6 process

router.get("/reset", (_, res) => {
  try {
    pkill.full("k6");
    serviceManager.reset();
    controlManager.reset();
    fs.readdir("./", (err: NodeJS.ErrnoException | null, files: string[]) => {
      files.forEach((file) => {
        if (file.startsWith("lastrun-")) {
          fs.unlinkSync(file);
        }
      });
      res.send({
        message: "Reset done, last run files deleted",
      });
    });
  } catch (err) {
    res.status(500).send({
      err,
    });
  }
});

router.get("/scale", (req, res) => {
  const queryParams = req.query;
  const newVUs = queryParams.vus as string;
  // check if vus is a valid number
  if (!newVUs || isNaN(parseInt(newVUs)) || parseInt(newVUs) <= 0) {
    res.status(400).send({
      message: "Invalid inputs",
    });
    return;
  }

  if (!controlManager.isK6Running()) {
    res.send({
      message: "No tests are running. Nothing to scale!",
    });
    return;
  }
  try {
    controlManager.scaleTests(parseInt(newVUs));
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

router.get("/status/:service/:scenario", scenarioCheck, async (req, res) => {
  const service = req.params.service as ServiceNameType;
  const scenario = req.query.scenario as string;
  console.log("status/service - " + service);
  try {
    const status = await controlManager.getK6Status(service, scenario);
    if (status.status === 200) {
      res.set("Content-Type", "text/html");
      return res.send(Buffer.from(status.data as string));
    }
    return res.send(status);
  } catch (err) {
    res.status(500).send({
      err,
      message: "Error occured while getting status",
    });
  }
});

module.exports = router;
