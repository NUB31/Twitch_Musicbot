import { getSettings } from "./config";
import { io } from "socket.io-client";

function startServer() {
  try {
    const settings = getSettings();
    console.log(`Connecting to  ws://localhost:${settings.dashboardPort}`);
    const socket = io(`ws://localhost:${settings.dashboardPort}`);
    return socket;
  } catch (err) {
    console.error("Something went wrong starting the server. ERROR:");
    throw err;
  }
}

const socket = startServer();

socket.on("connect", () => {
  socket.emit("storeClientInfo", { role: "music" });
});

let connectionStatus = true;
setInterval(() => {
  if (socket.disconnected) {
    console.log("Lost connection");
    connectionStatus = false;
  } else {
    if (!connectionStatus) {
      console.log("Connection reinstated");
    }
    connectionStatus = true;
  }
}, 2000);

export default socket;
