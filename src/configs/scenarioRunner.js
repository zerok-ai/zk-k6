// import { K6Stage } from "utils/types.js";
// import { DEFAULT_PARAMS } from "../utils/constants";
// import { parseStages } from "../utils/functions";

const DEFAULT_PARAMS = {
  INITIAL_VUS: 1000,
  MAX_VUS: 1000,
  RATE: 220,
  STAGES: "1_300-1_400",
  DURATION: "10s",
  TIMEUNIT: "5m",
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
  return [parsedStages, limitArray];
};
export default class ScenarioRunner {
  constructor() {
    [this.stages, this.limits] = __ENV.STAGES
      ? parseStages(__ENV.STAGES)
      : DEFAULT_PARAMS.STAGES;
    this.rate =
      typeof __ENV.RATE !== "undefined" ? __ENV.RATE : DEFAULT_PARAMS.RATE;
    this.maxVUs =
      typeof __ENV.MAX_VUS !== "undefined"
        ? __ENV.MAX_VUS
        : DEFAULT_PARAMS.MAX_VUS;
    this.initialVUs =
      typeof __ENV.INITIAL_VUS !== "undefined"
        ? __ENV.INITIAL_VUS
        : DEFAULT_PARAMS.INITIAL_VUS;
    this.duration =
      typeof __ENV.DURATION !== "undefined"
        ? __ENV.DURATION
        : DEFAULT_PARAMS.DURATION;
    this.timeunit =
      typeof __ENV.TIMEUNIT !== "undefined"
        ? __ENV.TIMEUNIT
        : DEFAULT_PARAMS.TIMEUNIT;
    this.testTag =
      typeof __ENV.TEST_TAG !== "undefined" ? __ENV.TEST_TAG : null;
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
