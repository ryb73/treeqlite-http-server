import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import { type RequestBody, ResponseBody } from "../routes/exec.js";

export type TqlHttpClientConfig = {
  baseUrl: string;
};

export class TreeQLiteHttpRequestError extends Error {
  public constructor(
    public requestBody: RequestBody,
    public response: Response
  ) {
    super(`TreeQLiteHttpRequestError`);
    // eslint-disable-next-line @typescript-eslint/quotes, @shopify/prefer-class-properties
    this.name = "TreeQLiteHttpRequestError";
  }
}

export async function tqlExec(
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
