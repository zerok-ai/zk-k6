const express = require("express");
const { runTestForService } = require("../utils/startk6");
const { getStartParamsFromRequest } = require("../utils/functions");

const router = express.Router();

const serviceParamToServiceMap = {
  sapp: "app",
  ssofa: "sofa_shop",
  szk: "zk",
  ssoak: "zk_soak",
  sspill: "zk_spill",
};

// Start load test for a service
router.get("/start/:service", (req, res) => {
  const params = getStartParamsFromRequest(req, "service");
  try {
    runTestForService({ ...params }, (data) => {
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
router.get("/start-concurrent-tests", (req, res) => {
  const params = getStartParamsFromRequest(req, "concurrent");
  /**
   * sample params =  vus=2000&mvus=2000&rate=1800&stages=[[time]_[requests]_[ratelimit]]-[[time]_[requests]_[ratelimit]]_...
   * where ratelimit is defined as -> [Rate For Checkout]:[Rate For Coupon]
   */
  const serviceParam =
    query.sapp ?? query.ssofa ?? query.szk ?? query.ssoak ?? query.sspill;
  if (!serviceParam || !serviceParamToServiceMap[serviceParam]) {
    return res.status(400).send({
      message: "Invalid service",
    });
  }
  const service = serviceParamToServiceMap[serviceParam];
  const finalParams = {
    ...params,
    service,
    stages: queryParams[serviceParam],
  };
  try {
    runTestForService({ ...finalParams }, (data) => {
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

module.exports = router;
