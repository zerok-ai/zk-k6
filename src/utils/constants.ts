export const DELETE_TEMP_FILES_ROUTE = "/temp-files";

export const TEMP_FILE_PREFIX = "DELETELATER-";

export const SERVICES = ["sofa-shop"] as const;

export const DEFAULT_PARAMS = {
  INITIAL_VUS: 1000,
  MAX_VUS: 1000,
  RATE: 220,
  STAGES: "1_300-1_400",
  DURATION: "10s",
  TIMEUNIT: "1m",
  CONCURRENCY: "",
  TEST_TAG: "none",
};

export const APP_PORT = 8000;

export const DEFAULT_PROM_URL =
  "https://prom.loadclient03.getanton.com/api/v1/write";
export const DEFAULT_K6_URL = "http://localhost:8000";