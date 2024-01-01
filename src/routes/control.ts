import express, { Request, Response } from "express";
const pkill = require("pkill");
import controlManager from "../configs/k6ControlManager";
import serviceManager from "../configs/serviceManager";
import { ServiceNameType } from "../utils/types";
import { scenarioCheck } from "../utils/middleware";
import { getFileNamesFromFolder, getRunFromFileName } from "../utils/functions";

import fs from "fs";
import path from "path";
const router = express.Router();

// /*
//     Pauses k6 process
// */
// router.get("/:service/:scenario/pause", scenarioCheck, async (req, res) => {
//   try {
//     const service = req.params.service as ServiceNameType;
//     const scenario = req.params.scenario;
//     if (!serviceManager.isRunning(service, scenario)) {
//       return res.status(400).send({
//         message: "Scenario is not running",
//       });
//     }
//     const status = await controlManager.pauseTests();
//     if (status.status === 200) {
//       serviceManager.addPaused(service, scenario);
//     }
//     return res.send(status);
//   } catch (error) {
//     return res.status(500).send({
//       err: error,
//     });
//   }
// });

// // Resume k6 process
// router.get("/:service/:scenario/resume", async (req, res) => {
//   try {
//     const service = req.params.service as ServiceNameType;
//     const scenario = req.params.scenario;
//     const status = await controlManager.resumeTests();
//     if (status.status === 200) {
//       serviceManager.addRunning(service, scenario);
//     }
//     return res.send(status);
//   } catch (error) {
//     return res.send(error);
//   }
// });

// Reset k6 process

router.get("/reset", (_, res) => {
  try {
    pkill.full("k6");
    serviceManager.reset();
    controlManager.reset();
    fs.readdir(
      `${__dirname}/..`,
      (err: NodeJS.ErrnoException | null, files: string[]) => {
        files.forEach((file) => {
          if (file.startsWith("lastrun-")) {
            fs.unlink(file, () => {
              console.log("deleted file");
            });
          }
        });
        res.send({
          message: "Reset done, last run files deleted",
          data: {
            running: controlManager.isK6Running(),
            runningServices: serviceManager.getRunningServices(),
            pausedServices: serviceManager.getPausedServices(),
          },
        });
      }
    );
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

router.get("/lastrun", scenarioCheck, async (req, res) => {
  const service = req.query.service as ServiceNameType;
  const scenario = req.query.scenario as string;
  console.log("status/service - " + service + scenario);
  try {
    const status = await controlManager.getLastRunLog(service, scenario);
    if (status.status === 200) {
      res.set("Content-Type", "text/html");
      return res.send(Buffer.from(status.data as string));
    }
    return res.send(status);
  } catch (err) {
    console.log({ err });
    res.status(500).send({
      err,
      message: "Error occured while getting status",
    });
  }
});

router.get("/status", (_, res) => {
  const resp = {
    running: controlManager.isK6Running(),
    runningServices: serviceManager.getRunningServices(),
    pausedServices: serviceManager.getPausedServices(),
  };
  res.send({
    message: "Status fetched",
    data: resp,
  });
});

// fetch all runs
router.get("/runs", async (_, res) => {
  try {
    const files = await getFileNamesFromFolder("../runs");
    return res.status(200).send({
      message: "Runs fetched",
      data: files,
    });
  } catch {
    return res.status(500).send({
      message: "Error fetching runs",
    });
  }
});

// fetch single run
router.get("/runs/:run", async (req, res) => {
  const run = req.params.run;
  try {
    const data = await getRunFromFileName(run);
    res.set("Content-Type", "text/html");
    res.send(data);
  } catch (err) {
    console.log({ err });
    return res.status(500).send({
      message: "Error fetching run",
    });
  }
});




export default router;