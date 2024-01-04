import { SERVICES } from "./constants";

export type ServiceNameType = (typeof SERVICES)[number];

export type ServiceType = {
  name: ServiceNameType;
  scenarios: string[];
};

export type AllServicesType = Record<ServiceNameType, ServiceType>;

export type GenericObject = Record<string, any>;

export interface CallbackStatusType {
  message: string;
  status: number;
  data?: any;
}

export interface K6ParamsType {
  initialVUs: number;
  host: string;
  maxVUs: number;
  rate: number;
  stages: string;
  duration: string;
  timeunit: string;
  concurrency: string;
  testTag?: string;
  k6Script: string;
  scenario: string;
  service?: ServiceNameType;
  rndon: boolean;
  rndmemon: boolean;
  rndlimit: number;
  prom_host: string;
  run_id: string;
}

export type ServiceScenarioType = {
  // @TODO - add type for scenario
  [key in ServiceNameType]: string[];
};

export type K6Stage = {
  duration: string;
  target: number;
};
