import serviceManager from "../configs/serviceManager";
import express from "express";
import { getStartParamsFromRequest } from "../utils/functions";
import { GenericObject, K6ParamsType, ServiceNameType } from "../utils/types";
import { startScenario } from "../startk6";
import { scenarioCheck } from "../utils/middleware";

const router = express.Router();

// Start load test for a service
router.get("/start", scenarioCheck, async (req, res) => {
  const service = req.query.service as ServiceNameType;
  const scenario = req.query.scenario;
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
    console.log({ err });
    return res.status(500).send({
      err,
    });
  }
});

export default router;
