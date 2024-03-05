import { createServer } from "http";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks.js";
import type { TqlHttpClientConfig } from "treeqlite-http-client";
import {
  TreeQLiteHttpRequestError,
  tqlAll,
  tqlExec,
} from "treeqlite-http-client";
import { afterAll, assert, beforeAll, describe, test } from "vitest";
import app from "../app.js";

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

describe(`/all`, () => {
  describe(`good`, () => {
    test(`one`, async ({ expect }) => {
      const result = await tqlAll(getClientConfig(), {
        query: `select 1 as one`,
      });

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "one": 1,
          },
        ]
      `);
    });

    test(`many`, async ({ expect }) => {
      try {
        await tqlExec(getClientConfig(), {
          query: `create table if not exists "~/all/good/many" (one integer, two text)`,
        });

        await tqlExec(getClientConfig(), {
          query: `insert into "~/all/good/many" (one, two) values (?, ?), (?, ?), (?, ?)`,
          params: [1, `one`, 2, `two`, 3, `three`],
        });

        const selectResult = await tqlAll(getClientConfig(), {
          query: `select * from "~/all/good/many"`,
        });

        expect(selectResult).toMatchInlineSnapshot(`
          [
            {
              "one": 1,
              "two": "one",
            },
            {
              "one": 2,
              "two": "two",
            },
            {
              "one": 3,
              "two": "three",
            },
          ]
        `);
      } finally {
        await tqlExec(getClientConfig(), {
          query: `drop table "~/all/good/many"`,
        });
      }
    });
  });

  describe(`bad`, () => {
    test(`malformed query`, async ({ expect }) => {
      try {
        await tqlAll(getClientConfig(), {
          query: `kjhlakjfhldakjfhiduf`,
        });
      } catch (error) {
        assert(error instanceof TreeQLiteHttpRequestError);
        expect(error.response.status).toBe(500);
        expect(await error.response.text()).toBe(``);
        return;
      }

      expect.fail(`Expected an error`);
    });

    test(`non-select`, async ({ expect }) => {
      try {
        try {
          await tqlAll(getClientConfig(), {
            query: `create table if not exists "~/all/bad/non-select" (one integer)`,
          });
        } catch (error) {
          assert(error instanceof TreeQLiteHttpRequestError);
          expect(error.response.status).toBe(500);
          expect(await error.response.text()).toBe(``);
          return;
        }

        expect.fail(`Expected an error`);
      } finally {
        await tqlExec(getClientConfig(), {
          query: `drop table if exists "~/all/bad/non-select"`,
        });
      }
    });
  });
});
