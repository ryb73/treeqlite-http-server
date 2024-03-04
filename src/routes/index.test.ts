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

function getClientConfig(): TqlHttpClientConfig {
  return { baseUrl: getBaseUrl() };
}

describe(`/exec`, () => {
  describe(`good`, () => {
    test(`select`, async ({ expect }) => {
      const response = await tqlExec(getClientConfig(), {
        query: `select 1 as one`,
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
      try {
        const response = await tqlExec(getClientConfig(), {
          query: `create table if not exists "~/yooo" (one int)`,
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

        const insertResponse = await tqlExec(getClientConfig(), {
          query: `insert into "~/yooo" (one) values (2)`,
        });

        const insertResult = fd(ResponseBody, await insertResponse.json());

        expect(insertResult).toMatchInlineSnapshot(`
        {
          "result": {
            "changes": 1,
            "lastInsertRowid": 1,
          },
          "type": "noData",
        }
      `);
        expect(
          insertResponse.headers.get(`content-type`)
        ).toMatchInlineSnapshot(`"application/json; charset=utf-8"`);

        const selectResponse = await tqlExec(getClientConfig(), {
          query: `select * from "~/yooo"`,
        });

        expect(selectResponse.status).toBe(200);

        const selectResult = fd(ResponseBody, await selectResponse.json());

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
      const response = await fetch(`${getBaseUrl()}/exec`, {
        body: JSON.stringify({
          query: `kjhlakjfhldakjfhiduf`,
        } satisfies RequestBody),
        headers: {
          "content-type": `application/json`,
        },
        method: `POST`,
      });

      expect(response.status).toBe(500);
      expect(await response.text()).toBe(``);
    });
  });
});

type TqlHttpClientConfig = {
  baseUrl: string;
};

async function tqlExec(
  { baseUrl }: TqlHttpClientConfig,
  requestBody: RequestBody
) {
  return await fetch(`${baseUrl}/exec`, {
    body: JSON.stringify(requestBody),
    headers: {
      "content-type": `application/json`,
    },
    method: `POST`,
  });
}
