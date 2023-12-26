const { DEFAULT_PARAMS } = require("./constants");
import { Request } from "express";
import { K6ParamsType, ServiceNameType } from "utils/types";

export const getStartParamsFromRequest = (req: Request, type = "service") => {
  const service = req.params.service as ServiceNameType;
  const scenario = req.params.scenario;
  const qp = req.query;
  const {
    mvus,
    initialVUs,
    rate,
    stages,
    duration,
    timeunit,
    concurrency,
    tag,
  } = qp;
  const params: K6ParamsType = {
    initialVUs: checkIfNumber(initialVUs) ?? DEFAULT_PARAMS.INITIAL_VUS,
    maxVUs: checkIfNumber(mvus) ?? DEFAULT_PARAMS.MAX_VUS,
    rate: checkIfNumber(rate) ?? DEFAULT_PARAMS.RATE,
    stages: stages ?? DEFAULT_PARAMS.STAGES,
    duration: duration ?? DEFAULT_PARAMS.DURATION,
    timeunit: timeunit ?? DEFAULT_PARAMS.TIMEUNIT,
    concurrency: concurrency ?? DEFAULT_PARAMS.CONCURRENCY,
    testTag: tag ?? DEFAULT_PARAMS.TEST_TAG,
    k6Script: `../${service}/${scenario}.js`,
    scenario: scenario as string,
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

export function getContentType(ext: string) {
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

export const getTestRunDateString = () => {
  const date = new Date(Date.now());
  return `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
};

module.exports = {
  getStartParamsFromRequest,
  getContentType,
  getTestRunDateString,
};

export const checkIfNumber = (value: any) => {
  return !isNaN(value) ? Number(value) : null;
};
