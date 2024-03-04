import express from "express";
import { execRouter } from "./exec.js";

const router = express.Router();

router.use(`/exec`, execRouter);

export default router;
