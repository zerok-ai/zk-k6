import fs from "fs";
import express from "express";
import { getFileNamesFromFolder } from "../utils/functions";
import path from "path";

const router = express.Router();

// purge all runs
router.delete("/runs/purge", async (_, res) => {
  try {
    const files = await getFileNamesFromFolder("../runs");
    files.forEach((file) => {
      fs.unlink(path.join(__dirname, "../runs", file), () => {
        console.log("deleted file");
      });
    });
    return res.status(200).send({
      message: "All runs purged, log files deleted",
    });
  } catch {
    return res.status(500).send({
      message: "Error purging runs",
    });
  }
});

export default router;
