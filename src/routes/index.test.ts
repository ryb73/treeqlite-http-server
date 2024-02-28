import { createServer } from "http";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterAll, beforeAll, test, assert } from "vitest";
import { defined } from "@ryb73/super-duper-parakeet/lib/src/type-checks";
import app from "../app";

const server = createServer(app);

beforeAll(() => {
  server.listen(0);
});

afterAll(() => {
  server.close();
});

function getPort() {
  const address = defined(server.address());
  assert(typeof address === "object");
  return address.port;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
test(`index`, async ({ expect }) => {
  const response = await fetch(`http://localhost:${getPort()}`);
  const text = await response.text();
  expect(text).toMatchInlineSnapshot(`"Hello World!"`);
  expect(response.headers.get(`content-type`)).toMatchInlineSnapshot(
    `"text/plain; charset=utf-8"`
  );
});
