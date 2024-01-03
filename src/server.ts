// express
import express from "express";
import cors from "cors";
// ROUTES
import deleteRoutes from "./routes/delete";
import startRoutes from "./routes/start";
import controlRoutes from "./routes/control";
import serviceRoutes from "./routes/services";
import { APP_PORT } from "./utils/constants";

// ------------------ CONFIG ------------------
const app = express();

app.use(cors());

// ------------------ DELETE ROUTES ------------------

/*
 * /delete-temp-files - Deletes all temp files
 */
app.use(deleteRoutes);

// ------------------ START ROUTES ------------------

/*
 * /start/:service - Starts a test for a service
 */
app.use(startRoutes);

// ------------------ CONTROL ROUTES ------------------

/*
//  * /pause - Pauses all tests
//  * /resume - Resumes all tests
 * /reset - Resets all tests
//  * /scale - Scales all running tests
 * /status - Gets the status of k6
 * /purge - Purges all tests
 * /runs - Gets the list of runs
 * /runs/:run - Gets the run
 */
app.use(controlRoutes);

// --------------------- SERVICES ---------------------
/*
 * /services/list - Gets the list of services
 */
app.use(serviceRoutes);

// Start server
app.listen(APP_PORT, () => {
  console.log(`Example app listening on port ${APP_PORT}`);
});
