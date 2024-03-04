/* eslint-disable @typescript-eslint/no-use-before-define */
import { createServer } from "http";
import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks.js";
import { afterAll, assert, beforeAll, describe, test } from "vitest";
import app from "../app.js";
import { type RequestBody, ResponseBody } from "./exec.js";

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

type TqlHttpClientConfig = {
  baseUrl: string;
};

class TreeQLiteHttpRequestError extends Error {
  public constructor(
    public requestBody: RequestBody,
    public response: Response
  ) {
    super(`TreeQLiteHttpRequestError`);
    // eslint-disable-next-line @typescript-eslint/quotes, @shopify/prefer-class-properties
    this.name = "TreeQLiteHttpRequestError";
  }
}

async function tqlExec(
  { baseUrl }: TqlHttpClientConfig,
  requestBody: RequestBody
) {
  const response = await fetch(`${baseUrl}/exec`, {
    body: JSON.stringify(requestBody),
    headers: {
      "content-type": `application/json`,
    },
    method: `POST`,
  });

  if (!response.ok) {
    throw new TreeQLiteHttpRequestError(requestBody, response);
  }

  const json: unknown = await response.json();

  return fd(ResponseBody, json);
}
