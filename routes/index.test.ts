import { createServer } from "http";
// eslint-disable-next-line @typescript-eslint/no-shadow
import { afterAll, beforeAll, test } from "vitest";
import app from "../app";

app.set(`port`, 3000);

const server = createServer(app);

beforeAll(() => {
  server.listen(3000);
});

afterAll(() => {
  server.close();
});

// eslint-disable-next-line @typescript-eslint/no-shadow
test(`index`, async ({ expect }) => {
  const response = await fetch(`http://localhost:3000`);
  const text = await response.text();
  expect(text).toMatchInlineSnapshot(`"Hello World!"`);
  expect(response.headers.get(`content-type`)).toMatchInlineSnapshot(
    `"text/plain; charset=utf-8"`
  );
});
