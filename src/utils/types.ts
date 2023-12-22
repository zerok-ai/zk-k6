import { SERVICES } from "./constants";

export type ServiceNameType = (typeof SERVICES)[number];

export type ServiceType = {
  name: ServiceNameType;
  host: string;
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
}