import { createServer } from "http";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks.js";
import { afterAll, assert, beforeAll, describe, test } from "vitest";
import app from "../app.js";
import type { TqlHttpClientConfig } from "../rbx/treeqlite-client.js";
import {
  TreeQLiteHttpRequestError,
  tqlExec,
  tqlQuery,
} from "../rbx/treeqlite-client.js";

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

describe(`/query`, () => {
  describe(`good`, () => {
    test(`create/insert/drop`, async ({ expect }) => {
      try {
        const createResult = await tqlQuery(getClientConfig(), {
          query: `create table if not exists "~/query/good/cid" (id integer primary key autoincrement, one integer, two text)`,
        });

        expect(createResult).toMatchInlineSnapshot(`
          {
            "changes": 0,
            "lastInsertRowid": 0,
          }
        `);

        const insertOneResult = await tqlQuery(getClientConfig(), {
          query: `insert into "~/query/good/cid" (one, two) values (?, ?)`,
          params: [1, `one`],
        });

        expect(insertOneResult).toMatchInlineSnapshot(`
          {
            "changes": 1,
            "lastInsertRowid": 1,
          }
        `);

        const insertManyResult = await tqlQuery(getClientConfig(), {
          query: `insert into "~/query/good/cid" (one, two) values (?, ?), (?, ?), (?, ?)`,
          params: [2, `two`, 3, `three`, 4, `four`],
        });

        expect(insertManyResult).toMatchInlineSnapshot(`
          {
            "changes": 3,
            "lastInsertRowid": 4,
          }
        `);
      } finally {
        const dropResult = await tqlQuery(getClientConfig(), {
          query: `drop table if exists "~/query/good/cid"`,
        });

        expect(dropResult).toMatchInlineSnapshot(`
        {
          "changes": 0,
          "lastInsertRowid": 0,
        }
      `);
      }
    });

    // Not really a case that is expected to be used, but it works
    test(`select`, async ({ expect }) => {
      try {
        await tqlQuery(getClientConfig(), {
          query: `create table if not exists "~/query/good/select" (one integer)`,
        });

        const selectResult = await tqlQuery(getClientConfig(), {
          query: `select * from "~/query/good/select"`,
        });

        expect(selectResult).toMatchInlineSnapshot(`
          {
            "changes": 0,
            "lastInsertRowid": 0,
          }
        `);
      } finally {
        await tqlExec(getClientConfig(), {
          query: `drop table if exists "~/query/good/select"`,
        });
      }
    });
  });

  describe(`bad`, () => {
    test(`malformed query`, async ({ expect }) => {
      try {
        await tqlQuery(getClientConfig(), {
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
  });
});
