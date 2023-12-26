// express
import express from "express";
// ROUTES
import deleteRoutes from "./routes/delete";
import startRoutes from "./routes/start";
import controlRoutes from "./routes/control";
import scenariosRoutes from "./routes/scenarios";
import { APP_PORT } from "./utils/constants";

const app = express();

// ------------------ CONFIG ------------------

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
// app.use(uploadRoutes);

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
