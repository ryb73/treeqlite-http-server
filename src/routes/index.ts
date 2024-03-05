import express from "express";
import { allRouter } from "./all.js";
import { execRouter } from "./exec.js";
import { queryRouter } from "./query.js";

const router = express.Router();

router.use(`/all`, allRouter);
router.use(`/exec`, execRouter);
router.use(`/query`, queryRouter);

export default router;
