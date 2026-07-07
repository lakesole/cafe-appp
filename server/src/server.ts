import "dotenv/config";
import http from "http";
import app from "./app";
import { initSockets } from "./sockets";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const httpServer = http.createServer(app);
initSockets(httpServer);

httpServer.listen(port, () => {
  console.log(`CafeOrder server running on http://localhost:${port}`);
});
