import { getCurrentStageIndex } from 'https://jslib.k6.io/k6-utils/1.3.0/index.js';
import { sleep } from 'k6';
import http from 'k6/http';
import { Gauge, Trend } from 'k6/metrics';

const INITIAL_VUS = (__ENV.INITIAL_VUS) ? __ENV.INITIAL_VUS : 1000;
const MAX_VUS = (__ENV.MAX_VUS) ? __ENV.MAX_VUS : 1000;
const PROMETHEUS_REMOTE_URL = __ENV.PROMETHEUS_REMOTE_URL;
const RATE = __ENV.RATE;
const STAGES = __ENV.STAGES;
const DURATION = __ENV.DURATION;
const TIMEUNIT = __ENV.TIMEUNIT;
const SERVICE = __ENV.SERVICE;
const SCENARIO = (__ENV.SCENARIO) ? __ENV.SCENARIO : __ENV.SERVICE;
const CONCURRENCY = __ENV.CONCURRENCY;
const TEST_TAG = __ENV.TEST_TAG;
const HOST = __ENV.HOST;

export class ScenariosRunner{
    constructor(){
        this.scenarioStage = undefined;
        this.stageToRateLimit = {};
        this.concurrencies = [];
        this.initialVUs = INITIAL_VUS;
        this.maxVUs = MAX_VUS;
        this.duration = DURATION;
        this.timeUnit = TIMEUNIT;
        this.myTrend = {};
        this.myGauge = new Gauge('concurrency');
        this.scenarioMetrics = ['waiting', 'duration']
        this.scenarioProviders = []
    }

    registerScenarioProvider(scenarioProvider){
        this.scenarioProviders.push(scenarioProvider);
    }

    parseStages() {
        if (this.scenarioStage) {
            return;
        }

        if (CONCURRENCY && CONCURRENCY.length > 0) {
            const concurrencyStrings = CONCURRENCY.split('_');
            concurrencyStrings.map(concurrencyString => {
                this.concurrencies.push(parseInt(concurrencyString));
            });
        }

        //1_300-2_300
        this.scenarioStage = [];
        var stages = STAGES.split('-');
        var index = 0;
        stages.map(stageString => {
            //2m_800-6m_800
            var stage = stageString.split('_');
            var duration = stage[0];
            var requestssString = stage[1];
            var requests = parseInt(requestssString);
            var iterations = requests;

            //  set the rate limits if present
            if (stage.length > 2) {
                var rateLimit = stage[2];
                this.stageToRateLimit[index + ''] = rateLimit;
                console.log(this.stageToRateLimit[index + ''])
            }
            const transformedStage = { duration: duration, target: iterations };
            this.scenarioStage.push(transformedStage);
            index++;
        });
    }

    createScenarios() {
        this.parseStages();
        const scenariosMap = {};

        //loop over scenario providers
        this.scenarioProviders.forEach((scenarioProvider) => {
            scenario = scenarioProvider()
            scenario.stages = this.scenarioStage;
            scenario.preAllocatedVUs = this.initialVUs;
            scenario.maxVUs = this.maxVUs;
            scenario.timeUnit = this.timeUnit;
            var key = scenario.name;
            this.scenarioMetrics.forEach((metric) => {
                this.myTrend[key] = this.myTrend[key] || {};
                this.myTrend[key][metric] = new Trend(`custom_${metric}`);
            })
            scenariosMap[key] = scenario;
        })

        return scenariosMap;
    }

    processStageIndex() {
        var stageIndex = getCurrentStageIndex();
        if (this.concurrencies[stageIndex]) {
            this.myGauge.add(this.concurrencies[stageIndex], { run_id: TEST_TAG });
        }
        return stageIndex;
    }

    addTrendMetric(scenarioName, metricTiming){
        this.scenarioMetrics.forEach((metric) => {
            this.myTrend[scenarioName][metric].add(metricTiming, { run_id: TEST_TAG });
        })
    }
}

// const CHECKOUT_SCENARIO = SCENARIO + "_checkout"; //app_checkout, zk_checkout

// const scenarioRunner = new ScenariosRunner();
// scenarioRunner.registerScenarioProvider(() => {
//     return {
//         name: CHECKOUT_SCENARIO,
//         executor: 'ramping-arrival-rate',
//         exec: 'checkout',
//         startRate: 1,
//         startTime: '0s'
//     };
// });

// //k6 const to be exported
// export const options = {
//   discardResponseBodies: true,
//   scenarios: scenarioRunner.createScenarios(),
// };

// //k6 function to be exported
// export function setup() {
//   console.log(options)
// }

// const verticalScaleCount = {
//   // Count variable to control Mem consumed by each highmem API call.
//   'coupons': 15,  // 1 * 1MB
//   // Count variable to control CPU consumed by each highcpu API call.
//   'checkout': 333 * 1000,
// }

// export function checkout() {
//   const stageIndex = scenarioRunner.processStageIndex();
//   const params = {
//       tags: {
//         run_id: TEST_TAG,
//       },
//   };
//   if (scenarioRunner.stageToRateLimit[stageIndex + '']) {
//     params['headers'] = {
//       'rate-limit': scenarioRunner.stageToRateLimit[stageIndex + '']
//     }
//   }
//   const res = http.get('http://' + HOST + '/checkout?count=' + verticalScaleCount['checkout'], params);
//   scenarioRunner.addTrendMetric(CHECKOUT_SCENARIO, res.timings[metric]);
//   sleep(.5);
// }

// //k6 function to be exported
// export function teardown(data) {
//   // 4. teardown code
//   //SERVICE
//   console.log('Tearing down test started for ' + SERVICE);
//   options.scenarios.forEach((scenario) => {
//     scenarioRunner.addTrendMetric(scenario.name, 0);
//   });
//   const res = http.get('http://demo-load-generator.getanton.com/mark-closed/' + SERVICE, {
//     tags: {
//       run_id: TEST_TAG,
//     },
//   });
//   console.log(res);
// }
