import { createServer } from "http";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks.js";
import { afterAll, assert, beforeAll, describe, test } from "vitest";
import app from "../app.js";
import type { TqlHttpClientConfig } from "../rbx/treeqlite-client.js";
import { TreeQLiteHttpRequestError, tqlExec } from "../rbx/treeqlite-client.js";
import type { RequestBody } from "./exec.js";

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

function getBaseUrl() {
  return `http://localhost:${getPort()}`;
}

function getClientConfig(): TqlHttpClientConfig {
  return { baseUrl: getBaseUrl() };
}

describe(`/exec`, () => {
  describe(`good`, () => {
    test(`select`, async ({ expect }) => {
      const result = await tqlExec(getClientConfig(), {
        query: `select 1 as one`,
      });

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
    });

    test(`create`, async ({ expect }) => {
      try {
        const result = await tqlExec(getClientConfig(), {
          query: `create table if not exists "~/yooo" (one int)`,
        });

        expect(result).toMatchInlineSnapshot(`
          {
            "result": {
              "changes": 0,
              "lastInsertRowid": 0,
            },
            "type": "noData",
          }
        `);
      } finally {
        await tqlExec(getClientConfig(), {
          query: `drop table "~/yooo"`,
        });
      }
    });

    test(`insert/select`, async ({ expect }) => {
      try {
        await tqlExec(getClientConfig(), {
          query: `create table if not exists "~/yooo" (one int)`,
        });

        const insertResult = await tqlExec(getClientConfig(), {
          query: `insert into "~/yooo" (one) values (2)`,
        });

        expect(insertResult).toMatchInlineSnapshot(`
          {
            "result": {
              "changes": 1,
              "lastInsertRowid": 1,
            },
            "type": "noData",
          }
        `);

        const selectResult = await tqlExec(getClientConfig(), {
          query: `select * from "~/yooo"`,
        });

        expect(selectResult).toMatchInlineSnapshot(`
          {
            "data": [
              {
                "one": 2,
              },
            ],
            "type": "returnedData",
          }
        `);
      } finally {
        await tqlExec(getClientConfig(), {
          query: `drop table "~/yooo"`,
        });
      }
    });
  });

  describe(`bad`, () => {
    test(`malformed query`, async ({ expect }) => {
      const requestBody = {
        query: `kjhlakjfhldakjfhiduf`,
      } satisfies RequestBody;

      try {
        await tqlExec(getClientConfig(), requestBody);
      } catch (error) {
        assert(error instanceof TreeQLiteHttpRequestError);
        expect(error.response.status).toBe(500);
        expect(await error.response.text()).toBe(``);
        return;
      }

      expect.fail(`Expected an error`);
    });
  });
});
