import { ExecException } from "child_process";
import { ServiceNameType } from "./types";

const execute = require("child_process").exec;
const fs = require("fs");

export async function pauseK6() {
  try {
    // const passwdContent = await execute("cat /etc/passwd");
    execute(
      "sh ../core/pause_xk6.sh",
      (err: ExecException, stdout: string, stderr: string) => {
        console.log(err, stdout, stderr);
        if (err != null) {
          throw "Error pausing tests";
        }
      }
    );
  } catch (error) {
    console.log({ error });
    throw "Error pausing tests";
  }
}

export async function resumeK6() {
  try {
    console.log("Resuming Tests");
    // const passwdContent = await execute("cat /etc/passwd");
    execute(
      "sh ../core/resume_xk6.sh",
      (err: ExecException, stdout: string, stderr: string) => {
        if (err === null) {
          console.log("Resumed successfully");
        }
        throw "Error resuming tests";
      }
    );
  } catch (error) {
    throw "Error resuming tests";
  }
}

export async function scaleK6(newVUs: number) {
  try {
    console.log("Scaling Tests with new VUs: " + newVUs);
    // const passwdContent = await execute("cat /etc/passwd");
    execute(
      "sh ../core/scale_xk6.sh " + newVUs,
      (err: ExecException, stdout: string, stderr: string) => {
        console.log(err, stdout, stderr);
        if (err !== null) {
          throw "Error scaling tests";
        }
      }
    );
  } catch (error) {
    throw "Error scaling tests";
  }
}

export async function status(
  service: ServiceNameType,
  scenario: string
): Promise<string> {
  try {
    const data = await fs.readFile(`./lastrun-${service}-${scenario}.log`);
    const content = data.toString();
    const template = `<html><body><pre>${content}</pre></body></html>`;
    return template;
  } catch (err) {
    const content = `No status available ${err}`;
    const template = `<html><body><pre>${content}</pre></body></html>`;
    return template;
  }
}
