import { sleep } from 'k6';
import http from 'k6/http';
import { ScenariosRunner, SCENARIO, TEST_TAG, teardownToBeExported } from './k6/scenarioRunner.js';

const INVENTORY_SCENARIO = SCENARIO + "_inventory";

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
    name: 'sofa-shop',
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

export function inventory() {
  const stageIndex = scenarioRunner.processStageIndex();
  const params = {
      tags: {
        run_id: TEST_TAG,
      },
  };
  if (scenarioRunner.stageToRateLimit[stageIndex + '']) {
    params['headers'] = {
      'rate-limit': scenarioRunner.stageToRateLimit[stageIndex + '']
    }
  }
  var url = 'http://' + service.host + '/api/inventory/all';
  const res = http.get(url, params);
  // console.log('res.body  ', url, '  ', res.status, ' ')
  scenarioRunner.addTrendMetric(INVENTORY_SCENARIO, res);
  sleep(.5);
}

export function teardown(data){
  teardownToBeExported(scenarioRunner)
}