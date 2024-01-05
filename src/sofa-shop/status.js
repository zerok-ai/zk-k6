import { sleep, check } from "k6";
import http from "k6/http";
import { getCurrentStageIndex } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import ScenarioRunner from "../configs/scenarioRunner.js";
import { getParams } from "./functions.js";
import { INVENTORY_ALL_API_PATH } from "./constants.js";

const scenarioRunner = new ScenarioRunner();

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: {
    "sofa-shop-status": {
      executor: "ramping-arrival-rate",
      exec: "status",
      timeUnit: scenarioRunner.timeUnit,
      preAllocatedVUs: scenarioRunner.initialVUs,
      maxVUs: scenarioRunner.maxVUs,
      gracefulStop: "5s",
      stages: scenarioRunner.stages,
      startRate: scenarioRunner.rate,
    },
  },
};

export function status() {
  const stageIndex = getCurrentStageIndex();
  const limits = scenarioRunner.getLimits();
  const params = getParams(stageIndex, limits, scenarioRunner);
  const queryparams = `?rndon=${scenarioRunner.rndon}&rndlimit=${scenarioRunner.rndlimit}&rndmemon=${scenarioRunner.rndmemon}`;
  const endpoint = `${scenarioRunner.host}/api/inventory/status/200`;

  const res = http.get(endpoint, params);
  // Check for success
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
  sleep(0.1);
}
