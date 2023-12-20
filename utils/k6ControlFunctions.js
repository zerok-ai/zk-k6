const execute = require("child_process").exec;

async function pauseK6() {
  try {
    // const passwdContent = await execute("cat /etc/passwd");
    execute("sh ../core/pause_xk6.sh", (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err != null) {
        throw "Error pausing tests";
      }
    });
  } catch (error) {
    console.log({ error });
    throw "Error pausing tests";
  }
}

async function resumeK6() {
  try {
    console.log("Resuming Tests");
    // const passwdContent = await execute("cat /etc/passwd");
    execute("sh ../core/resume_xk6.sh", (err, stdout, stderr) => {
      if (err === null) {
        console.log("Resumed successfully");
      }
      throw "Error resuming tests";
    });
  } catch (error) {
    console.error(error.toString());
    throw "Error resuming tests";
  }
}

async function scaleK6(newVUs) {
  try {
    console.log("Scaling Tests with new VUs: " + newVUs);
    // const passwdContent = await execute("cat /etc/passwd");
    execute("sh ../core/scale_xk6.sh " + newVUs, (err, stdout, stderr) => {
      console.log(err, stdout, stderr);
      if (err !== null) {
        throw "Error scaling tests";
      }
    });
  } catch (error) {
    console.error(error.toString());
    throw "Error scaling tests";
  }
}

async function status(service, callback) {
  fs.readFile("./lastrun-" + service + ".log", function read(err, data) {
    if (err) {
      content = "No status available " + err;
    } else {
      content = data;
    }
    const template = "<html><body><pre> " + content + "</pre></body></html>";
    callback(template);
  });
}
module.exports = {
  pauseK6,
  resumeK6,
  scaleK6,
  status,
};
