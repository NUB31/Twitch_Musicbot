import io, { startServer } from "./helpers/socket";

import setup from "./helpers/setup";

setup().then(() => {
  console.log("Setup done, starting server");
  startServer();
  main();
});

async function main() {
  io.on("connection", (socket) => {
    socket.emit("yoyo");
  });
}
