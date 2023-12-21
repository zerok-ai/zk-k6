import { AllServicesType, ServiceNameType } from "utils/types";

const { SERVICES, POSSIBLE_SERVICES } = require("./resolver");

class ServiceManager {
  services: AllServicesType;
  possibleServices: ServiceNameType[];
  runningServices: ServiceNameType[] = [];
  constructor() {
    this.services = SERVICES;
    this.possibleServices = POSSIBLE_SERVICES;
    this.runningServices = [];
  }

  // check if service is valid
  isValidService(serviceName: ServiceNameType) {
    if (serviceName && Object.keys(this.services).includes(serviceName)) {
      return true;
    }
    return false;
  }

  //   check if scenario is valid
  isValidScenario(service: ServiceNameType, scenario: string) {
    if (this.isValidService(service) && scenario) {
      const allScenarios = this.services[service].scenarios;
      return allScenarios.some((sc) => sc === scenario);
    }
    return false;
  }

  // add to running services
  addToRunningServices(serviceName: ServiceNameType) {
    if (
      this.isValidService(serviceName) &&
      !this.isRunning(serviceName) &&
      !this.runningServices.includes(serviceName)
    ) {
      this.runningServices.push(serviceName);
    }
  }

  // remove from running services
  removeFromRunningServices(serviceName: ServiceNameType) {
    if (this.isValidService(serviceName)) {
      this.runningServices = this.runningServices.filter(
        (service) => service !== serviceName
      );
    }
  }

  // get host
  getHost(serviceName: ServiceNameType) {
    if (this.isValidService(serviceName)) {
      return this.services[serviceName].host;
    }
    return null;
  }

  // get service
  getService(serviceName: ServiceNameType) {
    if (this.isValidService(serviceName)) {
      return this.services[serviceName];
    }
    return null;
  }

  // get all services
  getAllServices() {
    return this.services;
  }

  // get possible services
  getPossibleServices() {
    return Object.keys(this.services);
  }

  // get service status
  isRunning(serviceName: ServiceNameType) {
    return (
      this.isValidService(serviceName) &&
      this.runningServices.includes(serviceName)
    );
  }

  // mark service as running
  // markAllAsPaused() {
  //   for (let i = 0; i < this.possibleServices.length; i++) {
  //     this.services[this.possibleServices[i]].isRunning = false;
  //   }
  // }
}
const serviceManager = new ServiceManager();

export default serviceManager;
