import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from "express";
import { isLeft } from "fp-ts/lib/Either.js";
import type { Type } from "io-ts";
import prettyReporter from "io-ts-reporters";

export function definePostRoute<RequestBody>(
  r: Router,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  RequestBody: Type<RequestBody, unknown>,
  handler: (
    req: ExpressRequest<unknown, unknown, unknown>,
    res: ExpressResponse<unknown>,
    decodedBody: RequestBody
  ) => void
) {
  r.post(
    path,
    (
      req: ExpressRequest<unknown, unknown, unknown>,
      res: ExpressResponse<unknown>
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

      handler(req, res, decodedBody.right);
    }
  );
}
