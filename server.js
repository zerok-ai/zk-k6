const express = require("express");
const app = express();

// ROUTES
const deleteRoutes = require("./routes/delete.js");
const startRoutes = require("./routes/start.js");
const uploadRoutes = require("./routes/uploadScript.js");
const controlRoutes = require("./routes/control.js");
const scenariosRoutes = require("./routes/scenarios.js");

// PORT
const { APP_PORT } = require("./configs/resolver.js");

// ------------------ DELETE ROUTES ------------------

/*
 * /delete-temp-files - Deletes all temp files
 */
app.use(deleteRoutes);

// ------------------ START ROUTES ------------------

/*
 * /start/:service - Starts a test for a service
 * /start-concurrent-tests - Starts concurrent tests for all services
 */
app.use(startRoutes);

// ------------------ UPLOAD ROUTES ------------------

/*
 * /upload - Uploads the script file to the storage from multer
 * /start/:service (POST) - Starts a test for a service with the latest uploaded script file
 */
app.use(uploadRoutes);

// ------------------ CONTROL ROUTES ------------------

/*
 * /pause - Pauses all tests
 * /resume - Resumes all tests
 * /reset - Resets all tests
 * /mark-closed/:service - Marks a service as closed
 * /scale - Scales all running tests
 * /status/:service - Gets the status of a service
 */
app.use(controlRoutes);

// ------------------ SCENARIOS ROUTES ------------------
/* 
  * /list/:scenario - Lists all runs for a scenario
  * /fetch/:scenario/:run - Fetches the run file for a scenario
*/
app.use(scenariosRoutes);


// Start server
app.listen(APP_PORT, () => {
  console.log(`Example app listening on port ${APP_PORT}`);
});
