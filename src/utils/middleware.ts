import serviceManager from "../configs/serviceManager";
import { NextFunction, Request, Response } from "express";
import { ServiceNameType } from "./types";

export const scenarioCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const scenario = req.params.scenario;
  const service = req.params.service;

  if (
    !serviceManager.isValidScenario(
      service as ServiceNameType,
      scenario as string
    )
  ) {
    return res.status(400).send({
      message: "Invalid scenario and/or service",
    });
  }
  next();
};
