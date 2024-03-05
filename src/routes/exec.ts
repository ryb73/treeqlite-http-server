import type { Response as ExpressResponse } from "express";
import express from "express";
import type { TypeOf } from "io-ts";
import { array, bigint, literal, number, strict, union, unknown } from "io-ts";
import { QueryResult, TreeQLiteError, tqlExec } from "treeqlite-node/nodejs";
import { definePostRoute } from "../rbx/definePostRoute.js";
import { tql } from "../tql.js";
import { TqlRequest } from "../TqlRequest.js";

const router = express.Router();

const RequestBody = TqlRequest;
type RequestBody = TypeOf<typeof RequestBody>;
export { RequestBody };

const AllResult = array(unknown);

const QueryResult = strict({
  changes: number,
  lastInsertRowid: union([bigint, number]),
});

const ResponseBody = union([
  strict({
    type: literal(`noData`),
    result: QueryResult,
  }),
  strict({
    type: literal(`returnedData`),
    data: AllResult,
  }),
]);
type ResponseBody = TypeOf<typeof ResponseBody>;
export { ResponseBody };

definePostRoute(
  router,
  `/`,
  RequestBody,
  (req, res: ExpressResponse<ResponseBody>, { query, params }) => {
    try {
      const result = tqlExec(tql, query, params);
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

export { router as execRouter };
