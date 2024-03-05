import {
  array,
  exact,
  intersection,
  number,
  partial,
  strict,
  string,
  union,
} from "io-ts";

const SqliteParam = union([number, string]);

export const TqlRequest = intersection([
  strict({
    query: string,
  }),
  exact(
    partial({
      params: array(SqliteParam),
    })
  ),
]);
