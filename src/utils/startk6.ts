import { ExecException } from "child_process";
import { CallbackStatusType, K6ParamsType, ServiceNameType } from "./types";
import { DEFAULT_K6_URL, DEFAULT_PROM_URL } from "./constants";
import serviceManager from "configs/serviceManager";
const execute = require("child_process").exec;
const { status } = require("./k6ControlFunctions.js");

const controlManager = require("../configs/k6ControlManager.js");
const { getTestRunDateString } = require("./functions.js");
export async function startK6(params: K6ParamsType) {
  const PROM_URL = process.env.PROM_WRITE_URL ?? DEFAULT_PROM_URL;
  const K6_URL_BASE = process.env.K6_URL_BASE ?? DEFAULT_K6_URL;
  const service = params.service as ServiceNameType;
  const {
    initialVUs,
    maxVUs,
    rate,
    stages,
    duration,
    timeunit,
    concurrency,
    testTag,
    k6Script,
    scenario,
  } = params;
  //app, zk, zk-spill, zk-soak
  try {
    let host = serviceManager.getHost(service);
    const dateString = getTestRunDateString();
    console.log({ PROM_URL });
    // k6 run --no-connection-reuse -o json -e CONCURRENCY="${concurrency}" \
    let command = `ulimit -n 65536;
          K6_PROMETHEUS_REMOTE_URL="${PROM_URL}" \
          ../core/k6 run --no-connection-reuse -o output-prometheus-remote -e CONCURRENCY="${concurrency}" \
          -e SERVICE="${service}" -e TIMEUNIT="${timeunit}" -e DURATION="${duration}" -e STAGES="${stages}" \
          -e RATE=${rate} -e PROMETHEUS_REMOTE_URL="${PROM_URL}" -e INITIAL_VUS="${initialVUs}" -e K6_URL_BASE="${K6_URL_BASE}" \
          -e MAX_VUS="${maxVUs}" -e HOST="${host}" -e SCENARIO="${service}-${scenario}" -e TEST_TAG="${testTag}" --tag run="${dateString}"\
          "${k6Script}"    2>&1 | tee "lastrun-${service}-${scenario}.log" `;
    execute(
      command,
      {
        cwd: __dirname,
      },
      (err: ExecException | null, stdout: string, stderr: string) => {
        console.log(err, stdout, stderr);
        if (err != null) {
          console.log("Error occured while running");
          serviceManager.removeFromRunning(service, scenario);
        }
      }
    );
  } catch (error: any) {
    console.error(error.toString());
  }
}

export async function startScenario(
  params: K6ParamsType,
  callback: (res: CallbackStatusType) => void
) {
  const { scenario } = params;
  const service = params.service as ServiceNameType;
  if (controlManager.isK6Paused()) {
    callback({
      message: "K6 is paused, no tests can run without resuming K6.",
      status: 200,
    });
    return;
  }

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
};
