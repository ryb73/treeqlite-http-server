import "dotenv-flow/config";

import { fd } from "@ryb73/super-duper-parakeet/lib/src/io/forceDecode.js";
import { NonEmptyString } from "io-ts-types";

export const treeqliteRootPath = fd(
  NonEmptyString,
  process.env[`TREEQLITE_ROOT_PATH`],
  `TREEQLITE_ROOT_PATH`
);
