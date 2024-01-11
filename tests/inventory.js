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

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: {
    "sofa-shop-inventory": {
      preallocatedVUs: 700,
      maxVUs: 2000,
      startRate: 2000,
      stages: [
        {
          duration: "30s",
          target: 3000,
        },
        {
          duration: "30s",
          target: 3000,
        },
      ],
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
  const res = http.get(endpoint, params);
  // Check for success
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
}
