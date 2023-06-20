import { sleep } from 'k6';
import http from 'k6/http';
import { ScenariosRunner } from './k6/scenarioRunner.js';

const CHECKOUT_SCENARIO = SCENARIO + "_checkout"; //app_checkout, zk_checkout

const scenarioRunner = new ScenariosRunner();
scenarioRunner.registerScenarioProvider(() => {
    return {
        name: CHECKOUT_SCENARIO,
        executor: 'ramping-arrival-rate',
        exec: 'checkout',
        startRate: 1,
        startTime: '0s'
    };
});

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
  const res = http.get('http://' + HOST + '/checkout?count=' + verticalScaleCount['checkout'], params);
  scenarioRunner.addTrendMetric(CHECKOUT_SCENARIO, res.timings[metric]);
  sleep(.5);
}

//k6 function to be exported
export function teardown(data) {
  // 4. teardown code
  //SERVICE
  console.log('Tearing down test started for ' + SERVICE);
  options.scenarios.forEach((scenario) => {
    scenarioRunner.addTrendMetric(scenario.name, 0);
  });
  const res = http.get('http://demo-load-generator.getanton.com/mark-closed/' + SERVICE, {
    tags: {
      run_id: TEST_TAG,
    },
  });
  console.log(res);
}
