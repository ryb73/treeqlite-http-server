/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
import http from "http";
import debugModule from "debug";
import app from "./app.js";

const debug = debugModule(`treeqlite-server:server`);

/**
 * Get port from environment and store in Express.
 */

const port = 3000;
app.set(`port`, port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on(`error`, onError);
server.on(`listening`, onListening);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: Error) {
  if ((error as { syscall?: string }).syscall !== `listen`) {
    throw error;
  }

  const bind = `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch ((error as { code?: string }).code) {
    case `EACCES`:
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case `EADDRINUSE`:
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === `string` ? `pipe ${addr}` : `port ${addr!.port}`;
  debug(`Listening on ${bind}`);
}
