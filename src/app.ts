import path from "path";
import cookieParser from "cookie-parser";
import type { ErrorRequestHandler } from "express";
import express from "express";
import logger from "morgan";
import indexRouter from "./routes/index.js";

const app = express();

app.use(logger(`dev`));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, `public`)));

app.use(`/`, indexRouter);

// eslint-disable-next-line func-style
const handleErrors: ErrorRequestHandler<unknown, unknown, unknown> = function (
  err: unknown,
  req,
  res,
  // eslint-disable-next-line unused-imports/no-unused-vars
  next
) {
  console.error(`Error handling request:`, err);

  res.status(500).end();
};

app.use(handleErrors);

export default app;
