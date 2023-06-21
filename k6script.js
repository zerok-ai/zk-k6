import { sleep } from 'k6';
import http from 'k6/http';
import { ScenariosRunner, SCENARIO, HOST, TEST_TAG, teardownToBeExported } from './k6/scenarioRunner.js';

const CHECKOUT_SCENARIO = SCENARIO + "_checkout"; //app_checkout, zk_checkout

const scenarioRunner = new ScenariosRunner();
const scenarioProvider = () => {
  return {
        executor: 'ramping-arrival-rate',
        exec: 'checkout',
        startRate: 1,
        startTime: '0s'
    };
}
scenarioRunner.registerScenarioProvider(CHECKOUT_SCENARIO, scenarioProvider);

//k6 const to be exported
export const options = {
  discardResponseBodies: true,
  scenarios: scenarioRunner.createScenarios(),
};

//k6 function to be exported
export function setup() {
  console.log(options)
}

const verticalScaleCount = {
  // Count variable to control Mem consumed by each highmem API call.
  'coupons': 15,  // 1 * 1MB
  // Count variable to control CPU consumed by each highcpu API call.
  'checkout': 333 * 1000,
}

export function checkout() {
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
  // const res = http.get('http://' + HOST + '/checkout?count=' + verticalScaleCount['checkout'], params);
  var url = 'http://' + HOST + '/api/inventory/all';
  const res = http.get(url, params);
  // console.log('res.body  ', url, '  ', res.status, ' ')
  scenarioRunner.addTrendMetric(CHECKOUT_SCENARIO, res);
  sleep(.5);
}

export function teardown(data){
  teardownToBeExported(scenarioRunner)
}

// checkout();