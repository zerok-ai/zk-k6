import express from "express";
import SERVICES from "../utils/services";

const router = express.Router();

// Define a route to handle incoming requests
router.get("/services/list", (req, res) => {
  return res.send({
    message: "List of services",
    data: SERVICES,
  });
});

export default router;
