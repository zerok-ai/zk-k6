import serviceManager from "configs/serviceManager";
import express from "express";
import { getStartParamsFromRequest } from "utils/functions";
import { startScenario } from "utils/startk6";
import { GenericObject, K6ParamsType, ServiceNameType } from "utils/types";

const router = express.Router();

const serviceParamToServiceMap: GenericObject = {
  sapp: "app",
  ssofa: "sofa_shop",
  szk: "zk",
  ssoak: "zk_soak",
  sspill: "zk_spill",
};

// Start load test for a service
router.get("/:service/:scenario/start", (req, res) => {
  const service = req.params.service as ServiceNameType;
  const scenario = req.params.scenario;
  if (!serviceManager.isValidScenario(service, scenario as string)) {
    return res.status(400).send({
      message: "Invalid service and/or scenario",
    });
  }

  const params = getStartParamsFromRequest(req, "service");

  try {
    startScenario({ ...params }, (data) => {
      const status = data.status ?? 200;
      res.status(status).send({
        ...data,
      });
    });
  } catch (err) {
    return res.status(500).send({
      err,
    });
  }
});

// Start concurrent load tests for a service
// router.get("/start-concurrent-tests", (req, res) => {
//   const params = getStartParamsFromRequest(req, "concurrent");
//   const query = req.query;
//   /**
//    * sample params =  vus=2000&mvus=2000&rate=1800&stages=[[time]_[requests]_[ratelimit]]-[[time]_[requests]_[ratelimit]]_...
//    * where ratelimit is defined as -> [Rate For Checkout]:[Rate For Coupon]
//    */
//   const serviceParam = (query.sapp ??
//     query.ssofa ??
//     query.szk ??
//     query.ssoak ??
//     query.sspill) as string;
//   if (!serviceParam || !serviceParamToServiceMap[serviceParam]) {
//     return res.status(400).send({
//       message: "Invalid service",
//     });
//   }
//   const service = serviceParamToServiceMap[serviceParam as string];
//   const finalParams: K6ParamsType = {
//     ...params,
//     service,
//     stages: query[serviceParam] as string,
//   };
//   try {
//     startScenario({ ...finalParams }, (data) => {
//       const status = data.status ?? 200;
//       res.status(status).send({
//         ...data,
//       });
//     });
//   } catch (err) {
//     return res.status(500).send({
//       err,
//     });
//   }
// });

export default router;
