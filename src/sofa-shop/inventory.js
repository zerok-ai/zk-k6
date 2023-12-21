import { sleep } from "k6";
import http from "k6/http";
import {
  ScenariosRunner,
  SCENARIO,
  TEST_TAG,
  teardownToBeExported,
} from "../core/scenarioRunner.js";

const INVENTORY_SCENARIO = SCENARIO;

const scenarioRunner = new ScenariosRunner();
const scenarioProvider = () => {
  return {
    executor: "ramping-arrival-rate",
    exec: "inventory",
    startRate: 1,
    startTime: "0s",
  };
};
const service = {
  name: "sofa-shop-inventory",
  exec: "inventory",
  host: "sofa-shop.mysql.loadclient03.getanton.com",
};
// scenarioRunner.registerScenarioProvider(INVENTORY_SCENARIO, scenarioProvider);

//k6 const to be exported
export const options = {
  discardResponseBodies: true,

  scenarios: {
    "sofa-shop-inventory": {
      executor: "ramping-arrival-rate",
      exec: "inventory",
      // Start iterations per `timeUnit`
      startRate: 300,

      // Start `startRate` iterations per minute
      timeUnit: "1m",

      // Pre-allocate necessary VUs.
      preAllocatedVUs: 50,
      gracefulStop: "5s",

      stages: [
        // Start 300 iterations per `timeUnit` for the first minute.
        { target: 3000, duration: "5s" },

        // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
        { target: 6000, duration: "5s" },

        // Continue starting 600 iterations per `timeUnit` for the following four minutes.
        { target: 60, duration: "5s" },

        // Linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minutes.
        // { target: 60, duration: "2m" },
      ],
    },
  },
};
function generateRandomHexString(length) {
  const chars = "abcdef0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

export function inventory() {
  //   const stageIndex = scenarioRunner.processStageIndex();
  //   const params = {
  //     tags: {
  //       run_id: TEST_TAG,
  //     },
  //     headers: {},
  //   };
  //   if (scenarioRunner.stageToRateLimit[stageIndex + ""]) {
  //     params["headers"]["rate-limit"] =
  //       scenarioRunner.stageToRateLimit[stageIndex + ""];
  //   }
  //
  const params = {
    tags: {
      run_id: TEST_TAG,
    },
    headers: {},
  };
  params["headers"]["traceparent"] =
    "00" +
    "-" +
    "6b6bbbbb" +
    generateRandomHexString(22) +
    "-" +
    generateRandomHexString(16) +
    "-" +
    "00";
  const url = "https://" + service.host + "/api/inventory/all";
  const res = http.get(url);
  //   scenarioRunner.addTrendMetric(INVENTORY_SCENARIO, res);
  sleep(0.5);
}

// export default inventory;

// export function teardown(data) {
//   teardownToBeExported(scenarioRunner);
// }
