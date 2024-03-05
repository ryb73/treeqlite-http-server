import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import {
  type RequestBody as AllRequestBody,
  ResponseBody as AllResponseBody,
} from "treeqlite-http-types/all";
import {
  type RequestBody as ExecRequestBody,
  ResponseBody as ExecResponseBody,
} from "treeqlite-http-types/exec";
import {
  type RequestBody as QueryRequestBody,
  ResponseBody as QueryResponseBody,
} from "treeqlite-http-types/query";

export type TqlHttpClientConfig = {
  baseUrl: string;
};

export class TreeQLiteHttpRequestError extends Error {
  public constructor(
    public requestBody: ExecRequestBody,
    public response: Response
  ) {
    super(`TreeQLiteHttpRequestError`);
    // eslint-disable-next-line @typescript-eslint/quotes, @shopify/prefer-class-properties
    this.name = "TreeQLiteHttpRequestError";
  }
}

export async function tqlExec(
  { baseUrl }: TqlHttpClientConfig,
  requestBody: ExecRequestBody
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

  return fd(ExecResponseBody, json);
}

export async function tqlAll(
  { baseUrl }: TqlHttpClientConfig,
  requestBody: AllRequestBody
) {
  const response = await fetch(`${baseUrl}/all`, {
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

  return fd(AllResponseBody, json);
}

export async function tqlQuery(
  { baseUrl }: TqlHttpClientConfig,
  requestBody: QueryRequestBody
) {
  const response = await fetch(`${baseUrl}/query`, {
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

  return fd(QueryResponseBody, json);
}
