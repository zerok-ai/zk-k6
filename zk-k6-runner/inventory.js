import { sleep, check } from "k6";
import http from "k6/http";
// import { INVENTORY_ALL_API_PATH } from "./constants.js";

function generateRandomHexString(length) {
  const chars = "abcde0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

const DEFAULT_STAGES = [
  {
    duration: "2m",
    target: 10000,
  },
  {
    duration: "3m",
    target: 10000,
  },
];

const parseStages = (stages) => {
  try {
    const stagesArray = stages.split("-");
    const parsedStages = stagesArray.map((stage, idx) => {
      const [duration, targetVUs, limit] = stage.split("_");
      const target = parseInt(targetVUs);
      return {
        duration,
        target,
      };
    });
    return parsedStages;
  } catch (err) {
    return DEFAULT_STAGES;
  }
};
const stages = parseStages(__ENV.STAGES);
const vus = parseInt(__ENV.VUS);
const startRate = parseInt(__ENV.START_RATE);
const maxVUs = parseInt(__ENV.MAX_VUS);
//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: {
    "sofa-shop-inventory": {
      preallocatedVUs: vus,
      maxVUs,
      startRate,
      stages,
      executor: "ramping-arrival-rate",
      exec: "inventory",
    },
  },
};

export function inventory() {
  const traceparent = `00-6b6eeeee${generateRandomHexString(
    22
  )}-${generateRandomHexString(16)}-00`;
  const params = {
    responseType: "text",
    headers: {},
  };
  params["headers"]["traceparent"] = traceparent;
  params["headers"]["Content-Type"] = "application/json";
  const endpoint = `http://inventory.sofa-shop-mysql.svc.cluster.local/api/inventory/all`;
  http.asyncRequest("GET", endpoint, null, params);
  // Check for success
  // check(res, {
  //   "is status 200": (r) => r.status === 200,
  // });
}
