import { ExecException } from "child_process";
import {
  CallbackStatusType,
  K6ParamsType,
  ServiceNameType,
} from "./utils/types";
import serviceManager from "./configs/serviceManager";
import controlManager from "./configs/k6ControlManager";
import { copyToLogFolder, getK6Command } from "./utils/functions";
const execute = require("child_process").exec;

export async function startK6(params: K6ParamsType) {
  const service = params.service as ServiceNameType;
  const { scenario } = params;
  try {
    let command = getK6Command(params);
    controlManager.markRunning(true);
    console.log("STARTING TESTS", params.run_id);
    execute(
      command,
      {
        cwd: __dirname,
        maxBuffer: 1024 * 1024 * 10,
      },
      (err: ExecException | null, stdout: string, stderr: string) => {
        serviceManager.removeFromRunning(service, scenario);
        // if no other services are running, mark the runner as not running
        if (!serviceManager.isAnyServiceRunning()) {
          controlManager.markRunning(false);
        }
        copyToLogFolder(service, scenario);
        if (err) {
          console.log("Error occurred while running", err);
        } else {
          console.log("Run completed");
          // save log file in logs folder
        }
      }
    );
  } catch (error: any) {
    serviceManager.removeFromRunning(service, scenario);
    // if no other services are running, mark the runner as not running
    if (!serviceManager.isAnyServiceRunning()) {
      controlManager.markRunning(false);
    }
    console.error(error.toString());
  }
}

export async function startScenario(
  params: K6ParamsType,
  callback: (res: CallbackStatusType) => void
) {
  const { scenario } = params;
  const service = params.service as ServiceNameType;
  // serviceManager.addService(service);

  if (serviceManager.isRunning(service, scenario)) {
    callback({
      message: "Scenario is already running",
      status: 200,
    });
    return;
  }

  try {
    serviceManager.addRunning(service, scenario);
    startK6(params);
    return callback({
      message: "Started testing",
      data: {
        service,
        scenario,
      },
      status: 200,
    });
  } catch (error) {
    serviceManager.addPaused(service, scenario);
    serviceManager.removeFromRunning(service, scenario);
    callback({
      message: "Error occured while starting tests, scenario is paused.",
      data: {
        service,
        scenario,
      },
      status: 500,
    });
    return;
  }
}

module.exports = {
  startK6,
  startScenario,
};
