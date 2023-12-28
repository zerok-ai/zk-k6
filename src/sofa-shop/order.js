import { sleep } from "k6";
import http from "k6/http";
import { getCurrentStageIndex } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import ScenarioRunner from "../configs/scenarioRunner.js";
import { getParams } from "./functions.js";
import {
  INVENTORY_SKU_INFO,
  ORDER_ERROR_MESSAGE,
  ORDER_API_PATH,
  ORDER_ERROR_STATUS,
  ORDER_SKU_INFO,
  INVENTORY_POST_API_PATH,
} from "./constants.js";

const scenarioRunner = new ScenarioRunner();

const service = {
  name: "sofa-shop-order",
  exec: "order",
  host: "sofa-shop.mysql.loadclient03.getanton.com",
};

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: {
    "sofa-shop-order": {
      executor: "ramping-arrival-rate",
      exec: "order",
      timeUnit: scenarioRunner.timeUnit,
      preAllocatedVUs: scenarioRunner.initialVUs,
      maxVUs: scenarioRunner.maxVUs,
      gracefulStop: "5s",
      stages: scenarioRunner.stages,
    },
  },
};

export function order() {
  const stageIndex = getCurrentStageIndex();
  const limits = scenarioRunner.getLimits();
  const params = getParams(stageIndex, limits, scenarioRunner);
  const baseUrl = `https://${service.host}`;

  const postBody = {
    orderLineItemDtoList: [ORDER_SKU_INFO],
  };
  const postUrl = `${baseUrl}${ORDER_API_PATH}`;
  const resp = http.post(postUrl, JSON.stringify(postBody), params);
  if (
    resp.status == ORDER_ERROR_STATUS &&
    resp.json().trace.includes(ORDER_ERROR_MESSAGE)
  ) {
    // console.log("FAILED ORDER");
    const putUrl = `${baseUrl}${INVENTORY_POST_API_PATH}`;
    const params = getParams(stageIndex, limits, scenarioRunner, false);
    const putResp = http.put(
      putUrl,
      JSON.stringify(INVENTORY_SKU_INFO),
      params
    );
  } else {
    // console.log("SUCCESSFUL ORDER");
  }
  sleep(0.5);
}

// export function teardown(data) {
//   teardownToBeExported(scenarioRunner);
// }
