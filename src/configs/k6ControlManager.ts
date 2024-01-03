import resumeK6, {
  getLastLog,
  pauseK6,
  scaleK6,
} from "../utils/k6ControlFunctions";
import { CallbackStatusType, ServiceNameType } from "../utils/types";

class K6ControlManager {
  isPaused: boolean;
  isRunning: boolean;
  constructor() {
    this.isPaused = false;
    this.isRunning = false;
  }
  markRunning(val: boolean) {
    this.isRunning = val;
  }
  isK6Running() {
    return this.isRunning;
  }

  isK6Paused() {
    return this.isPaused;
  }

  reset() {
    this.isPaused = false;
    this.isRunning = false;
  }

  // pause k6
  async pauseTests(): Promise<CallbackStatusType> {
    if (!this.isRunning || this.isPaused) {
      return {
        message: "K6 is already paused.",
        status: 204,
      };
    }
    try {
      await pauseK6();
      this.isPaused = true;
      this.isRunning = false;
      return {
        message: "K6 paused",
        status: 200,
      };
    } catch (error) {
      return {
        message: "Error occured while pausing K6",
        status: 500,
      };
    }
  }

  //    resume k6
  async resumeTests() {
    if (!this.isPaused && this.isRunning) {
      return {
        message: "Tests are already running.",
        status: 204,
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
  async scaleTests(newVUs: number): Promise<CallbackStatusType> {
    try {
      await scaleK6(newVUs);
      return {
        message: `K6 scaled to ${newVUs} VUs`,
        status: 200,
      };
    } catch (error) {
      return {
        status: 500,
        message: "Error occured while scaling K6",
      };
    }
  }

  //    status k6
  async getLastRunLog(
    service: ServiceNameType,
    scenario: string
  ): Promise<CallbackStatusType> {
    if (!this.isRunning) {
      return {
        message: "No tests are running. Nothing to get status!",
        status: 204,
      };
    }
    try {
      const content = await getLastLog(service, scenario);
      return {
        message: "Status fetched",
        status: 200,
        data: content,
      };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  //   reset k6
}
const k6ControlManager = new K6ControlManager();
export default k6ControlManager;
