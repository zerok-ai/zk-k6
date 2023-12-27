const { DEFAULT_PARAMS } = require("./constants");
import fs from "fs";
import path from "path";
import { Request } from "express";
import { K6ParamsType, ServiceNameType } from "../utils/types";
import dayjs from "dayjs";

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