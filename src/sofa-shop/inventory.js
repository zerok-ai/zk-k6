import { sleep, check } from "k6";
import http from "k6/http";
import { getCurrentStageIndex } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import ScenarioRunner from "../configs/scenarioRunner.js";
import { getParams } from "./functions.js";
import { INVENTORY_ALL_API_PATH } from "./constants.js";

const scenarioRunner = new ScenarioRunner();

const service = {
  name: "sofa-shop-inventory",
  exec: "inventory",
  host: "sofa-shop.mysql.devclient03.getanton.com",
};

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: {
    "sofa-shop-inventory": {
      executor: "ramping-arrival-rate",
      exec: "inventory",
      timeUnit: scenarioRunner.timeUnit,
      preAllocatedVUs: scenarioRunner.initialVUs,
      maxVUs: scenarioRunner.maxVUs,
      gracefulStop: "5s",
      stages: scenarioRunner.stages,
    },
  },
};

export function inventory() {
  const stageIndex = getCurrentStageIndex();
  const limits = scenarioRunner.getLimits();
  const params = getParams(stageIndex, limits, scenarioRunner);
  const queryparams = `?rndon=${scenarioRunner.rndon}&rndlimit=${scenarioRunner.rndlimit}&rndmemon=${scenarioRunner.rndmemon}`;
  const endpoint = `https://${service.host}${INVENTORY_ALL_API_PATH}${queryparams}`;

  const res = http.get(endpoint, params);
  // Check for success
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
  sleep(0.5);
}
