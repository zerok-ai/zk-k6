const { ServiceManager } = require("./configs/serviceManager");

// const { ServiceManager } = require('./configs/resolver');
const serviceManager = new ServiceManager();

sofaShop = serviceManager.getService('sofa-shop');
console.log(sofaShop);
