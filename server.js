const express = require('express')
const pkill = require('pkill');
const fs = require('fs');
const { PROM_URL, K6_URL_BASE, APP_PORT } = require('./configs/resolver');
const app = express()
const path = require('path');
const { ServiceManager } = require("./configs/serviceManager");
const execute = require('child_process').exec
const serviceManager = new ServiceManager();
const multer = require('multer');
const FILE_PREFIX = 'DELETELATER-';
const storage = multer.diskStorage({
    destination: './',
    filename: function (req, file, callback) {
        // Generate a custom filename
        const uniquePrefix = FILE_PREFIX;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        const fileName = uniquePrefix + file.fieldname + '-' + uniqueSuffix + fileExtension;
        callback(null, fileName);
    }
});
const upload = multer({ storage });
// const upload = multer({ dest: './' });
var running = false;
var paused = false;

//app, zk, zk-spill, zk-soak
app.get('/start-concurrent-tests', (req, res) => {

    const queryParams = req.query;
    const initialVUs = (queryParams.vus) ? queryParams.vus : 1000;
    const maxVUs = (queryParams.mvus) ? queryParams.mvus : 1000;
    const rate = (queryParams.rate) ? queryParams.rate : 220;
    const duration = (queryParams.duration) ? queryParams.duration : '5m';
    const timeunit = (queryParams.timeunit) ? queryParams.timeunit : '1m';
    const concurrency = (queryParams.concurrency) ? queryParams.concurrency : "";
    const testTag = (queryParams.tag) ? queryParams.tag : "none";
    
    /**
     * sample =  vus=2000&mvus=2000&rate=1800&stages=[[time]_[requests]_[ratelimit]]-[[time]_[requests]_[ratelimit]]_...
     * where ratelimit is defined as -> [Rate For Checkout]:[Rate For Coupon]
     */
   
    var testAttempted = false;
    if (queryParams.sapp){
        testAttempted = true;
        var service = 'app';
        runTestForService({ service, initialVUs, maxVUs, rate, stages: queryParams.sapp, duration, timeunit, concurrency, testTag }, (data) => {});
    }

    if (queryParams.ssofa){
        testAttempted = true;
        var service = 'sofa_shop';
        runTestForService({ service, initialVUs, maxVUs, rate, stages: queryParams.ssofa, duration, timeunit, concurrency, testTag }, (data) => {});
    }
 
    if (queryParams.szk) {
        testAttempted = true;
        var service = 'zk';
        runTestForService({ service, initialVUs, maxVUs, rate, stages: queryParams.szk, duration, timeunit, concurrency, testTag }, (data) => {});    

    } 
    
    if (queryParams.ssoak) {
        testAttempted = true;
        var service = 'zk_soak';
        runTestForService({ service, initialVUs, maxVUs, rate, stages: queryParams.ssoak, duration, timeunit, concurrency, testTag }, (data) => {});

    }

    if (queryParams.sspill) {
        testAttempted = true;
        var service = 'zk_spill';
        runTestForService({ service, initialVUs, maxVUs, rate, stages: queryParams.sspill, duration, timeunit, concurrency, testTag }, (data) => {});
        
    }

    if (!testAttempted){
        console.log(`no test in query parameters`)
    }

    res.send('started');
})


function runTestForService(params, callback) {

    const { service, initialVUs, maxVUs, rate, stages, duration, timeunit, concurrency, testTag } = params;
    if (paused && serviceManager.isRunning(service)) {
        callback('Tests are in paused state. Try resuming them!');
        return;
    }
    console.log('start/service - ' + service);

    serviceManager.addService(service);

    // const isServiceValid = serviceManager.isValid(service);
    // if (!isServiceValid) {
    //     callback('Invalid service name')
    //     return;
    // }

    if (serviceManager.isRunning(service)) {
        status(service, (data) => {
            callback(data);
        });
        return;
    }

    serviceManager.markRunning(service, true);
    try {
        startK6(params);
        callback('Started');
    } catch (error) {
        serviceManager.markRunning(service, false);
        callback(error);
        return;
    }
}

//app, zk, zk-spill, zk-soak
app.get('/delete/temps', (req, res) => {
    //delete all files with prefix FILE_PREFIX
    fs.readdir('./', (err, files) => {
        files.forEach(file => {
            if (file.startsWith(FILE_PREFIX)) {
                fs.unlinkSync(file);
            }
        });
        res.send('deleted');
    });
});

app.get('/start/:service', (req, res) => {
    const service = req.params.service;
    const queryParams = req.query;
    const initialVUs = (queryParams.vus) ? queryParams.vus : 1000;
    const maxVUs = (queryParams.mvus) ? queryParams.mvus : 1000;
    const rate = (queryParams.rate) ? queryParams.rate : 220;
    const stages = (queryParams.stages) ? queryParams.stages : '1_300-1_400';
    const duration = (queryParams.duration) ? queryParams.duration : '5m';
    const timeunit = (queryParams.timeunit) ? queryParams.timeunit : '1m';
    const concurrency = (queryParams.concurrency) ? queryParams.concurrency : "";
    const testTag = (queryParams.tag) ? queryParams.tag : "none";
    const rndon = (queryParams.rndon) ? queryParams.rndon : false;
    const rndlimit = (queryParams.rndlimit) ? queryParams.rndlimit : 0;
    const rndmemon = (queryParams.rndmemon) ? queryParams.rndmemon : 0;
    const k6ScriptFilePath = queryParams.k6ScriptFilePath;

    runTestForService({ rndon, rndlimit, rndmemon, service, initialVUs, maxVUs, rate, stages, duration, timeunit, concurrency, testTag, k6ScriptFilePath }, (data) => {
        res.send(data);
    });
})


app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const absolutePath = path.resolve(file.path);
    res.send('File uploaded at ' + absolutePath);
})

app.post('/start/:service', upload.single('file'), (req, res) => {
    const file = req.file;
    const absolutePath = path.resolve(file.path);
    const service = req.params.service;
    const queryParams = req.query;
    const initialVUs = (queryParams.vus) ? queryParams.vus : 1000;
    const maxVUs = (queryParams.mvus) ? queryParams.mvus : 1000;
    const rate = (queryParams.rate) ? queryParams.rate : 220;
    const stages = (queryParams.stages) ? queryParams.stages : '1_300-1_400';
    const duration = (queryParams.duration) ? queryParams.duration : '5m';
    const timeunit = (queryParams.timeunit) ? queryParams.timeunit : '1m';
    const concurrency = (queryParams.concurrency) ? queryParams.concurrency : "";
    const testTag = (queryParams.tag) ? queryParams.tag : "none";
    const k6ScriptFilePath = absolutePath;
    console.log('k6ScriptFilePath=', k6ScriptFilePath);
    runTestForService({ service, initialVUs, maxVUs, rate, stages, duration, timeunit, concurrency, testTag, k6ScriptFilePath }, (data) => {
        res.send(data);
    });
})

app.get('/pause', (req, res) => {
    if (!running) {
        res.send('No tests are running. Nothing to pause!');
        return;
    }
    if (paused) {
        res.send('Paused');
        return;
    }
    paused = true;
    try {
        pauseK6();
        res.send('Paused');
    } catch (error) {
        paused = false;
        res.send(error);
        return;
    }
})

app.get('/resume', (req, res) => {
    if (!running) {
        res.send('No tests are running. Nothing to resume!');
        return;
    }
    if (!paused && running) {
        res.send('Already running');
        return;
    }
    paused = false;
    try {
        resumeK6();
        res.send('Resumed');
    } catch (error) {
        paused = false;
        res.send(error);
        return;
    }
})

app.get('/reset', (req, res) => {
    serviceManager.markAllAsPaused();
    pkill.full('k6');
    fs.readdir('./', (err, files) => {
        files.forEach(file => {
            if (file.startsWith('lastrun-')) {
                //extract string sofa-shop-inventory from string lastrun-sofa-shop-inventory.log
                const regex = /lastrun-(.*).log/;
                const scenarioName = file.match(regex)[1];

                //create a folder with the service name if it doesn't exist under runs folder
                const folderPath = path.join(folderToServe, scenarioName);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                }
                //move the file to the folder created above
                const oldPath = path.join(__dirname, file);
                var newPath = path.join(folderPath, file);

                // append timestamp in YYYYmmddHHMMSS in IST time format to file name
                // const dateIST = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
                // const dateStringIST = dateIST.getUTCFullYear() + "" + (dateIST.getUTCMonth() + 1) + dateIST.getUTCDate() + dateIST.getUTCHours() + dateIST.getUTCMinutes() + dateIST.getUTCSeconds();
                newPath = newPath.replace('.log', '-' + Date.now() + '.log');

                fs.renameSync(oldPath, newPath);
                // fs.unlinkSync(file);
            }
        });
        // res.send('deleted');
        res.send("Reset done");
    });
    
})


// app.get('/reset/scenario/:scenario', (req, res) => {
//     const scenarioName = req.params.scenario;
//     serviceManager.markAllAsPaused();
//     pkill.full('k6');
//     fs.readdir('./', (err, files) => {
//         files.forEach(file => {
//             if (file.startsWith('lastrun-')) {
//                 //extract string sofa-shop-inventory from string lastrun-sofa-shop-inventory.log
//                 const regex = /lastrun-(.*).log/;
//                 const scenarioName = file.match(regex)[1];

//                 //create a folder with the service name if it doesn't exist under runs folder
//                 const folderPath = path.join(folderToServe, scenarioName);
//                 if (!fs.existsSync(folderPath)) {
//                     fs.mkdirSync(folderPath);
//                 }
//                 //move the file to the folder created above
//                 const oldPath = path.join(__dirname, file);
//                 var newPath = path.join(folderPath, file);

//                 // append timestamp in YYYYmmddHHMMSS in IST time format to file name
//                 const dateIST = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
//                 const dateStringIST = dateIST.getUTCFullYear() + "" + (dateIST.getUTCMonth() + 1) + dateIST.getUTCDate() + dateIST.getUTCHours() + dateIST.getUTCMinutes() + dateIST.getUTCSeconds();
//                 newPath = newPath.replace('.log', '-' + dateStringIST + '.log');

//                 fs.renameSync(oldPath, newPath);
//                 // fs.unlinkSync(file);
//             }
//         });
//         // res.send('deleted');
//         res.send("Reset done");
//     });
    
// })

app.get('/mark-closed/:service', (req, res) => {
    const service = req.params.service;
    serviceManager.markRunning(service, false);
    res.send("Marked for service " + service);
})

app.get('/scale', (req, res) => {
    const queryParams = req.query;
    const newVUs = queryParams.vus;

    if (!newVUs || newVUs === 0) {
        res.send('Invalid input!');
        return;
    }

    if (!running) {
        res.send('No tests are running. Nothing to scale!');
        return;
    }
    try {
        scaleK6(newVUs);
        res.send('Scaled');
    } catch (error) {
        res.send(error);
        return;
    }
})

app.get('/status/:service', (req, res) => {
    const service = req.params.service;
    console.log('status/service - ' + service);
    const isServiceValid = serviceManager.isValid(service);
    if (!isServiceValid) {
        res.send('Invalid service name')
        return;
    }

    status(service, (data) => res.send(data.toString()));
})

app.get('/history/status/:service', (req, res) => {
    const service = req.params.service;
    console.log('history/status/service - ' + service);

    statusHistorical(service, (data) => res.send(data.toString()));
})



app.listen(APP_PORT, () => {
    console.log(`Example app listening on port ${APP_PORT}`)
})

async function startK6(params) {
    const { service, initialVUs, maxVUs, rate, stages, duration, timeunit, concurrency, testTag, k6ScriptFilePath, rndon, rndlimit, rndmemon } = params;
    //app, zk, zk-spill, zk-soak
    try {   
        let host = serviceManager.getHost(service);
        let date=new Date(Date.now());
        var dateString = date.getUTCFullYear() +"/"+ (date.getUTCMonth()+1) +"/"+ date.getUTCDate() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();

        // k6 run --no-connection-reuse -o json -e CONCURRENCY="${concurrency}" \
        let command = `ulimit -n 65536;
        K6_PROMETHEUS_REMOTE_URL="${PROM_URL}" \
        ./core/k6 run --no-connection-reuse -o output-prometheus-remote -e CONCURRENCY="${concurrency}" \
        -e SERVICE="${service}" -e RNDMEMON="${rndmemon}" -e RNDON="${rndon}" -e RNDLIMIT="${rndlimit}" -e TIMEUNIT="${timeunit}" -e DURATION="${duration}" -e STAGES="${stages}" \
        -e RATE=${rate} -e PROMETHEUS_REMOTE_URL="${PROM_URL}" -e INITIAL_VUS="${initialVUs}" -e K6_URL_BASE="${K6_URL_BASE}" \
        -e MAX_VUS="${maxVUs}" -e HOST="${host}" -e SCENARIO="${service}" -e TEST_TAG="${testTag}" --tag run="${dateString}" \
        ${k6ScriptFilePath} 2>&1 | tee "lastrun-${service}.log" `;

        console.log("-- command: " + command);
        execute(command, (err, stdout, stderr) => {
                console.log(err, stdout, stderr)
                if (err != null) {
                    console.log("Error occured while running ", err);
                    serviceManager.markRunning(service, false);
                }
            })
    } catch (error) {
        console.error(error.toString());
    }
}

async function pauseK6() {
    try {
        console.log("Pausing Tests");
        // const passwdContent = await execute("cat /etc/passwd");
        execute('sh ../core/pause_xk6.sh', (err, stdout, stderr) => {
            console.log(err, stdout, stderr)
            if (err != null) {
                console.log("Error occured while pausing");
                paused = false;
            }
        })
    } catch (error) {
        console.error(error.toString());
    }
}

async function resumeK6() {
    try {
        console.log("Resuming Tests");
        // const passwdContent = await execute("cat /etc/passwd");
        execute('sh ../core/resume_xk6.sh', (err, stdout, stderr) => {
            console.log(err, stdout, stderr)
            if (err === null) {
                console.log("Resumed successfully");
                paused = false;
            }
        })
    } catch (error) {
        console.error(error.toString());
    }
}

async function scaleK6(newVUs) {
    try {
        console.log("Scaling Tests with new VUs: " + newVUs);
        // const passwdContent = await execute("cat /etc/passwd");
        execute('sh ../core/scale_xk6.sh ' + newVUs, (err, stdout, stderr) => {
            console.log(err, stdout, stderr)
            if (err === null) {

            }
        })
    } catch (error) {
        console.error(error.toString());
    }
}

async function status(service, callback) {
    fs.readFile('./lastrun-' + service + '.log', function read(err, data) {
        if (err) {
            content = "No status available " + err;
        } else {
            content = data;
        }
        const template = "<html><body><pre> " + content + "</pre></body></html>";
        callback(template);
    });
}

async function statusHistorical(service, callback) {
    //service conatins this string 'lastrun-sofa-shop-inventory-1690534442436.log'. Extract the service name from it. Service name is between the strings lastrun- and -<timespamt>.log
    const pattern = /lastrun-(.*?)-\d+\.log/;

    const scenarioName = pattern.exec(service)[1];
    const filePath = './runs/' + scenarioName + '/' + service;
    fs.readFile(filePath, function read(err, data) {
        if (err) {
            content = "No status available " + err;
        } else {
            content = data;
        }
        const template = "<html><body><pre> " + content + "</pre></body></html>";
        callback(template);
    });
}

const folderToServe = path.join(__dirname, 'runs');

// Define a route to handle incoming requests
app.get('/list/:scenario', (req, res) => {
  const scenario = req.params.scenario;

  // Construct the file path
  const filePath = path.join(folderToServe, scenario);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: 'Scenario not found' });
    } else {
      //Get files in folder path present here filePath
        fs.readdir(filePath, (err, files) => {
            if (err) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.send(files);
            }
        });
    }
  });
});

// Define a route to handle incoming requests
app.get('/fetch/:scenario/:run', (req, res) => {
  const scenario = req.params.scenario;
  const runFileName = req.params.run;

  // Construct the file path
  const filePath = path.join(folderToServe, scenario);
  const runFilePath = path.join(filePath, runFileName);

  // Check if the file exists
  fs.access(runFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    } else {
      // Read and serve the file
      fs.readFile(runFilePath, (err, data) => {
        if (err) {
          res.status(500).json({ error: 'Internal server error' });
        } else {
          // Set the appropriate Content-Type header based on the file's extension
          const ext = path.extname(runFileName).toLowerCase();
          const contentType = getContentType(ext);
          res.set('Content-Type', contentType);
          res.send(data);
        }
      });
    }
  });
});

// Helper function to determine the Content-Type based on the file extension
function getContentType(ext) {
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    // Add more cases as needed for other file types
    default:
      return 'application/octet-stream';
  }
}


