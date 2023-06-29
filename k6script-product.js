import { sleep } from 'k6';
import http from 'k6/http';
// const crypto = require('k6/crypto');
import { ScenariosRunner, SCENARIO, TEST_TAG, teardownToBeExported } from './core/scenarioRunner.js';

const PRODUCT_SCENARIO = SCENARIO;// + "_product";

const scenarioRunner = new ScenariosRunner();
const scenarioProvider = () => {
  return {
        executor: 'ramping-arrival-rate',
        exec: 'product',
        startRate: 1,
        startTime: '0s'
    };
}
const service = {
    name: 'sofa-shop-product',
    exec: 'product',
    host: 'product.sofa-shop.svc.cluster.local',
}
scenarioRunner.registerScenarioProvider(PRODUCT_SCENARIO, scenarioProvider);

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
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

export function product() {
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
  params['headers']['traceparent'] = '00' + '-' + 'dddddddd' + generateRandomHexString(22) + '-' + generateRandomHexString(16) + '-' + '00'
  var url = 'http://' + service.host + '/api/product';
  const res = http.get(url, params);
  scenarioRunner.addTrendMetric(PRODUCT_SCENARIO, res);
  sleep(.5);
}

export function teardown(data){
  teardownToBeExported(scenarioRunner)
}