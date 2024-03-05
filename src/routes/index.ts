import express from "express";
import { allRouter } from "./all.js";
import { execRouter } from "./exec.js";

const router = express.Router();

router.use(`/all`, allRouter);
router.use(`/exec`, execRouter);

export default router;
