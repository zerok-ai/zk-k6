const { PROM_URL, K6_URL_BASE } = require("../configs/resolver.js");
const execute = require("child_process").exec;
const { status } = require("./k6ControlFunctions.js");
const serviceManager = require("../configs/serviceManager.js");
const controlManager = require("../configs/k6ControlManager.js");
async function startK6(params) {
  const {
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
  } = params;
  //app, zk, zk-spill, zk-soak
  try {
    let host = serviceManager.getHost(service);
    let date = new Date(Date.now());
    var dateString =
      date.getUTCFullYear() +
      "/" +
      (date.getUTCMonth() + 1) +
      "/" +
      date.getUTCDate() +
      " " +
      date.getUTCHours() +
      ":" +
      date.getUTCMinutes() +
      ":" +
      date.getUTCSeconds();

    // k6 run --no-connection-reuse -o json -e CONCURRENCY="${concurrency}" \
    let command = `ulimit -n 65536;
          K6_PROMETHEUS_REMOTE_URL="${PROM_URL}" \
          ./core/k6 run --no-connection-reuse -o output-prometheus-remote -e CONCURRENCY="${concurrency}" \
          -e SERVICE="${service}" -e TIMEUNIT="${timeunit}" -e DURATION="${duration}" -e STAGES="${stages}" \
          -e RATE=${rate} -e PROMETHEUS_REMOTE_URL="${PROM_URL}" -e INITIAL_VUS="${initialVUs}" -e K6_URL_BASE="${K6_URL_BASE}" \
          -e MAX_VUS="${maxVUs}" -e HOST="${host}" -e SCENARIO="${service}" -e TEST_TAG="${testTag}" --tag run="${dateString}" \
          ${k6ScriptFilePath} 2>&1 | tee "lastrun-${service}.log" `;

    console.log("-- command: " + command);
    execute(command, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err != null) {
        console.log("Error occured while running");
        serviceManager.markRunning(service, false);
      }
    });
  } catch (error) {
    console.error(error.toString());
  }
}

async function runTestForService(params, callback) {
  const { service } = params;
  if (controlManager.isK6Paused() && serviceManager.isRunning(service)) {
    callback({
      message: "Tests are paused",
      status: 200,
    });
    return;
  }
  console.log("start/service - " + service);

  serviceManager.addService(service);

  const isServiceValid = serviceManager.isValid(service);
  if (!isServiceValid) {
    callback({
      message: "Service is not valid",
      status: 400,
    });
    return;
  }

  if (serviceManager.isRunning(service)) {
    status(service, (data) => {
      callback({
        message: "Service is already running",
        status: 204,
        data,
      });
    });
    return;
  }
  serviceManager.markRunning(service, true);
  try {
    startK6(params);
    callback({
      message: "Started tests",
      status: 200,
    });
  } catch (error) {
    serviceManager.markRunning(service, false);
    callback({
      message: "Error occured while starting tests",
      status: 500,
    });
    return;
  }
}

module.exports = {
  runTestForService,
  startK6,
};