const { SERVICES, POSSIBLE_SERVICES } = require('./resolver');

class ServiceManager {
    constructor() {
        this.services = SERVICES;
        this.possibleServices = POSSIBLE_SERVICES;
    }

    // check if service is valid
    isValid(serviceName) {
        if (serviceName && this.possibleServices.includes(serviceName)) {
            return true;
        }
        return false;
    }

    // get host
    getHost(serviceName) {
        if (this.isValid(serviceName)) {
            return this.services[serviceName].host;
        }
        return null;
    }

    // get service
    getService(serviceName) {
        if (this.isValid(serviceName)) {
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
        return this.possibleServices;
    }

    // get service status
    isRunning(serviceName){
        return this.isValid(serviceName) && this.services[serviceName].isRunning;
    }

    // mark service as running
    markRunning(serviceName, isRunning){
        if (this.isValid(serviceName)){
            this.services[serviceName].isRunning = isRunning;
        }
    }

    // mark service as running
    markAllAsPaused(){
        for (let i = 0; i < this.possibleServices.length; i++){
            this.services[this.possibleServices[i]].isRunning = false;
        }
    }

}


exports.ServiceManager = ServiceManager;