const { pauseK6, resumeK6 } = require("../utils/k6ControlFunctions");
const { SERVICES, POSSIBLE_SERVICES } = require("./resolver");

class K6ControlManager {
  constructor() {
    this.isPaused = false;
    this.isRunning = false;
  }
  isK6Running() {
    return this.isRunning;
  }

  isK6Paused() {
    return this.isPaused;
  }

  // pause k6
  async pauseTests() {
    if (!this.isRunning || this.isPaused) {
      return {
        message: "No tests are running or tests are already paused.",
      };
    }
    try {
      await pauseK6();
      this.isPaused = true;
      this.isRunning = false;
      return {
        message: "K6 paused",
      };
    } catch (error) {
      console.log({ error });
      this.isPaused = false;
      throw error;
    }
  }

  //    resume k6
  async resumeTests() {
    if (!this.isPaused && this.isRunning) {
      return {
        message: "Tests are already running.",
      };
    }
    try {
      await resumeK6();
      this.isPaused = false;
      this.isRunning = true;
      return {
        message: "K6 resumed",
      };
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  //    scale k6
  async scaleTests(newVUs) {
    if (!this.isRunning) {
      return {
        message: "No tests are running. Nothing to scale!",
      };
    }
    try {
      await scaleK6(newVUs);
      return {
        message: `K6 scaled to ${newVUs} VUs`,
      };
    } catch (error) {
      throw error;
    }
  }

  //    status k6
  async getK6Status(service) {
    if (!this.isRunning) {
      return {
        message: "No tests are running. Nothing to get status!",
      };
    }
    try {
      const status = await status(service);
      return {
        message: status,
      };
    } catch (error) {
      throw error;
    }
  }

  //   reset k6
}
const k6ControlManager = new K6ControlManager();
module.exports = k6ControlManager;
