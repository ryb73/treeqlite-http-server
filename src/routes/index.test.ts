import { createServer } from "http";
import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks.js";
import { afterAll, assert, beforeAll, describe, test } from "vitest";
import app from "../app.js";
import { type RequestBody, ResponseBody } from "./index.js";

const server = createServer(app);

beforeAll(() => {
  server.listen(0);
});

afterAll(() => {
  server.close();
});

function getPort() {
  const address = defined(server.address());
  assert(typeof address === `object`);
  return address.port;
}

test(`NODE_ENV`, ({ expect }) => {
  expect(process.env[`NODE_ENV`]).toMatchInlineSnapshot(`"test"`);
});

function getBaseUrl() {
  return `http://localhost:${getPort()}`;
}

describe(`/exec`, () => {
  describe(`good`, () => {
    test(`select`, async ({ expect }) => {
      const response = await fetch(`${getBaseUrl()}/exec`, {
        body: JSON.stringify({
          query: `select 1 as one`,
        } satisfies RequestBody),
        headers: {
          "content-type": `application/json`,
        },
        method: `POST`,
      });

      const result = fd(ResponseBody, await response.json());

      expect(result).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "one": 1,
            },
          ],
          "type": "returnedData",
        }
      `);
      expect(response.headers.get(`content-type`)).toMatchInlineSnapshot(
        `"application/json; charset=utf-8"`
      );
    });

    test(`create`, async ({ expect }) => {
      const response = await fetch(`${getBaseUrl()}/exec`, {
        body: JSON.stringify({
          query: `create table if not exists "~/yooo" (one int)`,
        } satisfies RequestBody),
        headers: {
          "content-type": `application/json`,
        },
        method: `POST`,
      });

      const result = fd(ResponseBody, await response.json());

      expect(result).toMatchInlineSnapshot(`
        {
          "result": {
            "changes": 0,
            "lastInsertRowid": 0,
          },
          "type": "noData",
        }
      `);
      expect(response.headers.get(`content-type`)).toMatchInlineSnapshot(
        `"application/json; charset=utf-8"`
      );
    });
  });
});
