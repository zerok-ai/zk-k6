import { AllServicesType } from "./types";

const SERVICES: AllServicesType = {
  "sofa-shop": {
    name: "sofa-shop",
    host: "inventory.sofa-shop-mysql.svc.cluster.local",
    scenarios: ["inventory", "order", "product"],
  },
};

export default SERVICES;
