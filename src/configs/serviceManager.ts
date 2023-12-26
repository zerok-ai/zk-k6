import SERVICES from "utils/services";
import {
  AllServicesType,
  ServiceNameType,
  ServiceScenarioType,
} from "utils/types";

class ServiceManager {
  services: AllServicesType;
  runningServices: ServiceScenarioType;
  pausedServices: ServiceScenarioType;
  constructor() {
    this.services = SERVICES;
    this.runningServices = {} as ServiceScenarioType;
    this.pausedServices = {} as ServiceScenarioType;
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

  // pause all services
  pauseAllServices() {
    this.pausedServices = { ...this.pausedServices, ...this.runningServices };
    this.runningServices = {} as ServiceScenarioType;
  }

  // resume all services
  resumeAllServices() {
    this.runningServices = { ...this.runningServices, ...this.pausedServices };
    this.pausedServices = {} as ServiceScenarioType;
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
  isRunning(svc: ServiceNameType, scenario: string) {
    return (
      this.runningServices[svc] && this.runningServices[svc].includes(scenario)
    );
  }

  // get paused status
  isPaused(svc: ServiceNameType, scenario: string) {
    return (
      this.pausedServices[svc] && this.pausedServices[svc].includes(scenario)
    );
  }

  // remove from paused services
  removeFromPaused(svc: ServiceNameType, scenario: string) {
    if (this.isValidScenario(svc, scenario)) {
      if (!this.pausedServices[svc]) {
        this.pausedServices[svc] = [];
        return;
      }
      this.pausedServices[svc] = this.pausedServices[svc].filter(
        (sc) => sc !== scenario
      );
    }
  }

  // remove from running services
  removeFromRunning(svc: ServiceNameType, scenario: string) {
    if (!this.runningServices[svc]) {
      this.runningServices[svc] = [];
      return;
    }
    this.runningServices[svc] = this.runningServices[svc].filter(
      (sc) => sc !== scenario
    );
  }

  // add scenario
  addRunning(svc: ServiceNameType, scenario: string) {
    if (this.isPaused(svc, scenario)) {
      this.removeFromPaused(svc, scenario);
    }
    if (!this.runningServices[svc]) {
      this.runningServices[svc] = [];
    }
    // to avoid duplicates
    const scenarios = Array.from(
      new Set([...this.runningServices[svc], scenario])
    );
    this.runningServices[svc] = scenarios;
  }

  // add paused
  addPaused(svc: ServiceNameType, scenario: string) {
    if (this.isRunning(svc, scenario)) {
      this.removeFromRunning(svc, scenario);
    }
    if (!this.pausedServices[svc]) {
      this.pausedServices[svc] = [];
    }
    this.pausedServices[svc].push(scenario);
  }

  reset() {
    this.runningServices = {} as ServiceScenarioType;
    this.pausedServices = {} as ServiceScenarioType;
  }
}
const serviceManager = new ServiceManager();

export default serviceManager;
