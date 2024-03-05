import type { Response as ExpressResponse } from "express";
import express from "express";
import type { TypeOf } from "io-ts";
import { bigint, number, strict, union } from "io-ts";
import { QueryResult, TreeQLiteError, tqlQuery } from "treeqlite-node/nodejs";
import { definePostRoute } from "../rbx/definePostRoute.js";
import { tql } from "../tql.js";
import { TqlRequest } from "../TqlRequest.js";

const router = express.Router();

const RequestBody = TqlRequest;
type RequestBody = TypeOf<typeof RequestBody>;
export { RequestBody };

const QueryResult = strict({
  changes: number,
  lastInsertRowid: union([bigint, number]),
});

const ResponseBody = QueryResult;
type ResponseBody = TypeOf<typeof ResponseBody>;
export { ResponseBody };

definePostRoute(
  router,
  `/`,
  RequestBody,
  (req, res: ExpressResponse<ResponseBody>, { query, params }) => {
    try {
      const result = tqlQuery(tql, query, params);
      res.send(result).end();
    } catch (error) {
      console.error(`Error running query:`, query, params);
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

export { router as queryRouter };
