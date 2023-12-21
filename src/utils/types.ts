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
