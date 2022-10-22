import { Server } from "socket.io";
import { getSettings } from "./config";
import http from "http";

const server = http.createServer();
const io = new Server(server);

export default io;

export function startServer() {
  try {
    const settings = getSettings();
    server.listen(settings.serverPort, () => {
      console.log(`Server listening on port ${settings.serverPort}`);
    });
  } catch (err) {
    console.error("Something went wrong starting the server. ERROR:");
    throw err;
  }
}
