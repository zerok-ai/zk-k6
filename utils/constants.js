const DELETE_TEMP_FILES_ROUTE = "/temp-files";

const TEMP_FILE_PREFIX = "DELETELATER-";
const initialVUs = queryParams.vus ?? 1000;
const maxVUs = queryParams.mvus ? queryParams.mvus : 1000;
const rate = queryParams.rate ? queryParams.rate : 220;
const stages = queryParams.stages ? queryParams.stages : "1_300-1_400";
const duration = queryParams.duration ? queryParams.duration : "5m";
const timeunit = queryParams.timeunit ? queryParams.timeunit : "1m";
const concurrency = queryParams.concurrency ? queryParams.concurrency : "";
const testTag = queryParams.tag ? queryParams.tag : "none";
const k6ScriptFilePath = queryParams.k6ScriptFilePath;
const DEFAULT_PARAMS = {
  INITIAL_VUS: 1000,
  MAX_VUS: 1000,
  RATE: 220,
  STAGES: "1_300-1_400",
  DURATION: "5m",
  TIMEUNIT: "1m",
  CONCURRENCY: "",
  TEST_TAG: "none",
};

module.exports = {
  DELETE_TEMP_FILES_ROUTE,
  TEMP_FILE_PREFIX,
  DEFAULT_PARAMS,
};
