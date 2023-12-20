const { DEFAULT_PARAMS } = require("./constants");

const getStartParamsFromRequest = (req, type = "service") => {
  const service = req.params.service;
  const queryParams = req.query;
  const params = {
    initialVUs: queryParams.vus ?? DEFAULT_PARAMS.INITIAL_VUS,
    maxVUs: queryParams.mvus ?? DEFAULT_PARAMS.MAX_VUS,
    rate: queryParams.rate ?? DEFAULT_PARAMS.RATE,
    stages: queryParams.stages ?? DEFAULT_PARAMS.STAGES,
    duration: queryParams.duration ?? DEFAULT_PARAMS.DURATION,
    timeunit: queryParams.timeunit ?? DEFAULT_PARAMS.TIMEUNIT,
    concurrency: queryParams.concurrency ?? DEFAULT_PARAMS.CONCURRENCY,
    testTag: queryParams.tag ?? DEFAULT_PARAMS.TEST_TAG,
    k6ScriptFilePath: queryParams.k6ScriptFilePath,
  };
  switch (type) {
    case "service":
      return { service, ...params };
    case "concurrent":
      return { ...params };
    default:
      return { ...params };
  }
};

function getContentType(ext) {
  switch (ext) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".json":
      return "application/json";
    // Add more cases as needed for other file types
    default:
      return "application/octet-stream";
  }
}

module.exports = {
  getStartParamsFromRequest,
  getContentType,
};