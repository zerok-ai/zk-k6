const { DEFAULT_PARAMS } = require("./constants");
import fs from "fs";
import path from "path";
import { Request } from "express";
import { K6ParamsType, ServiceNameType } from "../utils/types";
import dayjs from "dayjs";
import { DEFAULT_PROM_URL } from "./constants";

export const getStartParamsFromRequest = (req: Request, type = "service") => {
  const service = req.query.service as ServiceNameType;
  const scenario = req.query.scenario;
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
    k6Script: `./${service}/${scenario}.js`,
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

export const checkIfNumber = (value: any) => {
  return !isNaN(value) ? Number(value) : null;
};

export const copyToLogFolder = (service: ServiceNameType, scenario: string) => {
  const rootFolderPath = path.join(__dirname, "../");
  const logFilePath = `${__dirname}/../lastrun-${service}-${scenario}.log`;
  const logContent = fs.readFileSync(logFilePath, "utf-8");
  // Create a timestamped file name for the new log file using dayjs
  const now = dayjs();
  const formattedTimestamp = now.format("DDMMM_HHmmss");
  const newLogFileName = `${service}-${scenario}_${formattedTimestamp}.log`;
  // Define the path for the new log file in the 'logs' folder
  const logsFolderPath = path.join(rootFolderPath, "runs");
  const newLogFilePath = path.join(logsFolderPath, newLogFileName);
  // Ensure the 'logs' folder exists
  if (!fs.existsSync(logsFolderPath)) {
    fs.mkdirSync(logsFolderPath);
  }
  // Write the content to the new log file
  fs.writeFileSync(newLogFilePath, logContent, "utf-8");
  // Write the new log file
};

export const getFileNamesFromFolder = (folder: string) => {
  const folderPath = path.join(__dirname, folder);
  try {
    // Read the contents of the folder synchronously
    const files = fs.readdirSync(folderPath);
    return files;
  } catch (error) {
    console.error(`Error reading folder: ${folderPath}`, error);
    throw "Error reading folder";
  }
};

export const getRunFromFileName = (fileName: string) => {
  const folderPath = path.join(__dirname, "../runs");
  const filePath = path.join(folderPath, fileName);
  try {
    // Read the contents of the folder synchronously
    const dataBuffer = fs.readFileSync(filePath);
    const content = dataBuffer.toString("utf-8"); // Convert buffer to string
    return `<html><body><pre>${content}</pre></body></html>`;
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    throw "Error reading file";
  }
};

export const parseStages = (stages: string) => {
  // stages are in the form [duration1]_[targetVUs1]-[duration2]_[targetVUs2]
  const stagesArray = stages.split("-");
  const parsedStages = stagesArray.map((stage) => {
    const [duration, targetVUs] = stage.split("_");
    return {
      duration,
      target: checkIfNumber(targetVUs) ?? (DEFAULT_PARAMS.MAX_VUS as number),
    };
  });
  return parsedStages;
};

export const getK6Command = (params: K6ParamsType) => {
  const PROM_URL = DEFAULT_PROM_URL;
  const {
    service,
    scenario,
    timeunit,
    stages,
    initialVUs,
    maxVUs,
    testTag,
    k6Script,
    rate,
  } = params;
  const dateString = getTestRunDateString();
  const logFilePath = `./lastrun-${service}-${scenario}.log`;
  const promUrl = `K6_PROMETHEUS_REMOTE_URL="${PROM_URL}"`;
  const k6Binary = `./core/k6`;
  const k6RunOptions = `--no-connection-reuse -o output-prometheus-remote`;
  const k6EnvMap = {
    SERVICE: service,
    TIMEUNIT: timeunit,
    STAGES: stages,
    RATE: rate,
    INITIAL_VUS: initialVUs,
    MAX_VUS: maxVUs,
    SCENARIO: `${service}-${scenario}`,
    TEST_TAG: testTag,
  };
  const k6Env = Object.entries(k6EnvMap)
    .map(([key, value]) => `-e ${key}="${value}"`)
    .join(" ");
  let command = `ulimit -n 65536;
          ${promUrl} \ \
          ${k6Binary} run ${k6RunOptions} \
          ${k6Env} \
          "${k6Script}"  2>&1 | tee "${logFilePath}" `;
  return command;
};