const DEFAULT_PARAMS = {
  INITIAL_VUS: 1000,
  MAX_VUS: 1000,
  RATE: 220,
  STAGES: "1_300-1_400",
  DURATION: "10s",
  TIMEUNIT: "1s",
  CONCURRENCY: "",
  TEST_TAG: "none",
};

const parseStages = (stages) => {
  // stages are in the form [duration1]_[targetVUs1]-[duration2]_[targetVUs2]
  const stagesArray = stages.split("-");
  const limitArray = [];
  const parsedStages = stagesArray.map((stage, idx) => {
    const [duration, targetVUs, limit] = stage.split("_");
    const target = parseInt(targetVUs);
    if (limit) {
      limitArray[idx] = parseInt(limit);
    }
    return {
      duration,
      target,
    };
  });
  console.log({ parsedStages });
  return [parsedStages, limitArray];
};
export default class ScenarioRunner {
  constructor() {
    [this.stages, this.limits] = parseStages(__ENV.STAGES);
    this.rate = __ENV.RATE;
    this.maxVUs = __ENV.MAX_VUS;
    this.initialVUs = __ENV.INITIAL_VUS;
    this.host = __ENV.HOST;
    this.timeunit = DEFAULT_PARAMS.TIMEUNIT;
    this.rndon = __ENV.RNDON;
    this.rndlimit = __ENV.RNDLIMIT;
    this.rndmemon = __ENV.RNDMEMON;
  }
  getStages() {
    return this.stages;
  }
  getLimits() {
    return this.limits;
  }
  getTestTag() {
    return this.testTag;
  }
}
