const express = require("express");
const fs = require("fs");
const { runTestForService } = require("../utils/startk6");

const router = express.Router();

// Start load test for a service
router.get("/start/:service", (req, res) => {
  const service = req.params.service;
  const queryParams = req.query;
  const initialVUs = queryParams.vus ? queryParams.vus : 1000;
  const maxVUs = queryParams.mvus ? queryParams.mvus : 1000;
  const rate = queryParams.rate ? queryParams.rate : 220;
  const stages = queryParams.stages ? queryParams.stages : "1_300-1_400";
  const duration = queryParams.duration ? queryParams.duration : "5m";
  const timeunit = queryParams.timeunit ? queryParams.timeunit : "1m";
  const concurrency = queryParams.concurrency ? queryParams.concurrency : "";
  const testTag = queryParams.tag ? queryParams.tag : "none";
  const k6ScriptFilePath = queryParams.k6ScriptFilePath;

  runTestForService(
    {
      service,
      initialVUs,
      maxVUs,
      rate,
      stages,
      duration,
      timeunit,
      concurrency,
      testTag,
      k6ScriptFilePath,
    },
    (data) => {
      res.send(data);
    }
  );
});

// Start concurrent load tests for a service
router.get("/start-concurrent-tests", (req, res) => {
  const queryParams = req.query;
  const initialVUs = queryParams.vus ? queryParams.vus : 1000;
  const maxVUs = queryParams.mvus ? queryParams.mvus : 1000;
  const rate = queryParams.rate ? queryParams.rate : 220;
  const duration = queryParams.duration ? queryParams.duration : "5m";
  const timeunit = queryParams.timeunit ? queryParams.timeunit : "1m";
  const concurrency = queryParams.concurrency ? queryParams.concurrency : "";
  const testTag = queryParams.tag ? queryParams.tag : "none";

  /**
   * sample =  vus=2000&mvus=2000&rate=1800&stages=[[time]_[requests]_[ratelimit]]-[[time]_[requests]_[ratelimit]]_...
   * where ratelimit is defined as -> [Rate For Checkout]:[Rate For Coupon]
   */

  var testAttempted = false;
  if (queryParams.sapp) {
    testAttempted = true;
    var service = "app";
    runTestForService(
      {
        service,
        initialVUs,
        maxVUs,
        rate,
        stages: queryParams.sapp,
        duration,
        timeunit,
        concurrency,
        testTag,
      },
      (data) => {}
    );
  }

  if (queryParams.ssofa) {
    testAttempted = true;
    var service = "sofa_shop";
    runTestForService(
      {
        service,
        initialVUs,
        maxVUs,
        rate,
        stages: queryParams.ssofa,
        duration,
        timeunit,
        concurrency,
        testTag,
      },
      (data) => {}
    );
  }

  if (queryParams.szk) {
    testAttempted = true;
    var service = "zk";
    runTestForService(
      {
        service,
        initialVUs,
        maxVUs,
        rate,
        stages: queryParams.szk,
        duration,
        timeunit,
        concurrency,
        testTag,
      },
      (data) => {}
    );
  }

  if (queryParams.ssoak) {
    testAttempted = true;
    var service = "zk_soak";
    runTestForService(
      {
        service,
        initialVUs,
        maxVUs,
        rate,
        stages: queryParams.ssoak,
        duration,
        timeunit,
        concurrency,
        testTag,
      },
      (data) => {}
    );
  }

  if (queryParams.sspill) {
    testAttempted = true;
    var service = "zk_spill";
    runTestForService(
      {
        service,
        initialVUs,
        maxVUs,
        rate,
        stages: queryParams.sspill,
        duration,
        timeunit,
        concurrency,
        testTag,
      },
      (data) => {}
    );
  }

  if (!testAttempted) {
    console.log(`no test in query parameters`);
  }

  res.send({
    message: "Tests started",
  });
});

module.exports = router;
