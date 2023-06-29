import { sleep } from 'k6';
import http from 'k6/http';
import { ScenariosRunner, SCENARIO, TEST_TAG, teardownToBeExported } from './core/scenarioRunner.js';

const INVENTORY_SCENARIO = SCENARIO;// + "_inventory";

const scenarioRunner = new ScenariosRunner();
const scenarioProvider = () => {
  return {
        executor: 'ramping-arrival-rate',
        exec: 'inventory',
        startRate: 1,
        startTime: '0s'
    };
}
const service = {
    name: 'sofa-shop-inventory',
    exec: 'inventory',
    host: 'inventory.sofa-shop.svc.cluster.local',
}
scenarioRunner.registerScenarioProvider(INVENTORY_SCENARIO, scenarioProvider);

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: scenarioRunner.createScenarios(),
};

//k6 function to be exported
export function setup() {
  console.log(options)
}

function generateRandomHexString(length) {
  const chars = 'abcdef0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
}

export function inventory() {
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
  params['headers']['traceparent'] = '00' + '-' + '6b6bbbbb' + generateRandomHexString(22) + '-' + generateRandomHexString(16) + '-' + '00'
  var url = 'http://' + service.host + '/api/inventory/all';
  const res = http.get(url, params);
  scenarioRunner.addTrendMetric(INVENTORY_SCENARIO, res);
  sleep(.5);
}

export function teardown(data){
  teardownToBeExported(scenarioRunner)
}