import express, { Request } from "express";
import path from "path";
import { getStartParamsFromRequest } from "../utils/functions";
import upload from "../utils/storage";
const router = express.Router();

router.post("/upload", upload.single("file"), (req: Request, res) => {
  const file = req.file;
  // @ts-expect-error - file is not defined in Request type
  const absolutePath = path.resolve(file.path);
  res.send({
    message: "File uploaded successfully",
    path: absolutePath,
  });
});

// router.post("/start/:service", upload.single("file"), (req, res) => {
//   const params = getStartParamsFromRequest(req, "service");
//   runTestForService(
//     {
//       ...params,
//     },
//     (data) => {
//       res.send(data);
//     }
//   );
// });

module.exports = router;
