import type { Response as ExpressResponse } from "express";
import express from "express";
import type { ResponseBody } from "treeqlite-http-types/all";
import { RequestBody } from "treeqlite-http-types/all";
import { TreeQLiteError, tqlAll } from "treeqlite-node/nodejs";
import { definePostRoute } from "../rbx/definePostRoute.js";
import { tql } from "../tql.js";

const router = express.Router();

definePostRoute(
  router,
  `/`,
  RequestBody,
  (req, res: ExpressResponse<ResponseBody>, { query, params }) => {
    try {
      const result = tqlAll(tql, query, params);
      res.send(result).end();
    } catch (error) {
      console.error(error);

      if (error instanceof TreeQLiteError) {
        res
          .status(500)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .send(`TreeQLiteError: ${error.message}` as any)
          .end();
        return;
      }

      res.status(500).end();
    }
  }
);

export { router as allRouter };
