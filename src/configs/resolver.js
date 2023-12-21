require("dotenv").config();

import ALL_SERVICES from "../utils/services";

const PROM_URL =
  "http://" +
  process.env.PROM_BASE +
  ":" +
  process.env.PROMM_PORT +
  process.env.PROM_WRITE;
const APP_PORT = process.env.APP_PORT;
const K6_URL_BASE = process.env.K6_URL_BASE;

_ProcessServices = (services) => {
  processedServices = {};
  for (let i = 0; i < services.length; i++) {
    processedServices[services[i].name] = services[i];
  }
  return processedServices;
};

const SERVICES = _ProcessServices(ALL_SERVICES);
const POSSIBLE_SERVICES = Object.keys(SERVICES);

exports.SERVICES = SERVICES;
exports.POSSIBLE_SERVICES = POSSIBLE_SERVICES;
exports.PROM_URL = "https://prom.loadclient03.getanton.com/api/v1/write";
exports.APP_PORT = APP_PORT;
exports.K6_URL_BASE = K6_URL_BASE;
