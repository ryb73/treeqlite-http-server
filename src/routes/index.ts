import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import express from "express";
import { isLeft } from "fp-ts/lib/Either.js";
import type { TypeOf } from "io-ts";
import {
  array,
  bigint,
  exact,
  intersection,
  literal,
  number,
  partial,
  strict,
  string,
  union,
  unknown,
} from "io-ts";
import prettyReporter from "io-ts-reporters";
import type { TreeQLiteConfig } from "treeqlite-node/nodejs";
import { QueryResult, TreeQLiteError, tqlExec } from "treeqlite-node/nodejs";
import { treeqliteRootPath } from "../config/treeqlite.js";

const router = express.Router();

const config: TreeQLiteConfig = {
  rootPath: treeqliteRootPath,
};

const SqliteParam = union([number, string]);

const RequestBody = intersection([
  strict({
    query: string,
  }),
  exact(
    partial({
      params: array(SqliteParam),
    })
  ),
]);
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

router.post(
  `/exec`,
  (
    req: ExpressRequest<unknown, ResponseBody, unknown>,
    res: ExpressResponse<ResponseBody>
  ) => {
    const decodedBody = RequestBody.decode(req.body);
    if (isLeft(decodedBody)) {
      res.status(400).send().end();
      console.error(
        `Decode error:`,
        prettyReporter.default.report(decodedBody)
      );
      return;
    }

    const { query, params } = decodedBody.right;

    try {
      const result = tqlExec(config, query, params);
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

export default router;
