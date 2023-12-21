const serviceManager = require("./configs/serviceManager");

const sofaShop = serviceManager.getService("sofa-shop");
console.log(sofaShop);
