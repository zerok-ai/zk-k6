import { sleep } from 'k6';
import http from 'k6/http';
// const crypto = require('k6/crypto');
import { ScenariosRunner, SCENARIO, TEST_TAG, teardownToBeExported } from './core/scenarioRunner.js';

const ORDER_SCENARIO = SCENARIO;// + "_order";

const scenarioRunner = new ScenariosRunner();
const scenarioProvider = () => {
  return {
        executor: 'ramping-arrival-rate',
        exec: 'order',
        startRate: 1,
        startTime: '0s'
    };
}
const service = {
    name: 'sofa-shop-order',
    exec: 'order',
    host: 'order.sofa-shop.svc.cluster.local',
}
scenarioRunner.registerScenarioProvider(ORDER_SCENARIO, scenarioProvider);

//k6 const to be exported
export const options = {
  // discardResponseBodies: true,
  scenarios: scenarioRunner.createScenarios(),
};

//k6 function to be exported
export function setup() {
  console.log(options)
}

// function generateRandomHexString(length) {
//   const chars = 'ABCDEF0123456789';
//   let result = '';

//   while (result.length < length) {
//     const randomBytes = crypto.randomBytes(length);
//     for (let i = 0; i < randomBytes.length && result.length < length; i++) {
//       const randomIndex = randomBytes[i] % chars.length;
//       result += chars.charAt(randomIndex);
//     }
//   }

//   return result;
// }

function generateRandomHexString(length) {
  const chars = 'ABCDEF0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

export function order() {
  const stageIndex = scenarioRunner.processStageIndex();
  const params = {
      tags: {
        run_id: TEST_TAG,
      },
      headers: {}
  };
  if (scenarioRunner.stageToRateLimit[stageIndex + '']) {
    params['headers']['rate-limit'] = scenarioRunner.stageToRateLimit[stageIndex + '']
  }
  params['headers']['traceparent'] = '00' + '-' + 'k6testordr' + generateRandomHexString(22) + '-' + generateRandomHexString(16) + '-' + '00'
  params['headers']['Content-Type'] = 'application/json'
  var url = 'http://' + service.host + '/api/order';
  var body2 = {
    "orderLineItemDtoList": [{
      "id": 0,
      "skuCode": "5e6dfeab-3b87-4834-a72f-b0e79741f3b4",
      "price": "825",
      "quantity": 1
    }]
  }

  const res = http.post(url, JSON.stringify(body2), params);
  var resBodyString = res.body;
  var resBody = {}
  try {
    const json = JSON.parse(resBodyString);
    resBody = json;
  } catch (error) {
  }
  
  if(resBody.status == 500 && resBody.trace.includes('item not in stock')){
    var updateInventoryUrl = 'http://inventory.sofa-shop.svc.cluster.local/api/inventory';
    var updateInventoryBody = {
        "sku": "5e6dfeab-3b87-4834-a72f-b0e79741f3b4",
        "currentInventory": 10
      }
    params['headers']['traceparent'] = '00' + '-' + 'k6testinvu' + generateRandomHexString(22) + '-' + generateRandomHexString(16) + '-' + '00'
    const updateInventoryResponse = http.put(updateInventoryUrl, JSON.stringify(updateInventoryBody), params);
    console.log('updateInventoryResponse Body -- ', updateInventoryResponse.body)
  }
  scenarioRunner.addTrendMetric(ORDER_SCENARIO, res);
  sleep(.5);
}

export function teardown(data){
  teardownToBeExported(scenarioRunner)
}