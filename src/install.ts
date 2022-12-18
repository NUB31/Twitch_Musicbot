import defaultSettings from "./bundledAssets/settings.json";
import download from "download";
import fallbackPlaylist from "./bundledAssets/assets/fallbackPlaylist.json";
import fs from "fs-extra";
import requestPlaylist from "./bundledAssets/assets/requestPlaylist.json";

const path = process.env.APPDATA + "\\nub31\\stream\\musicbot";

async function setup() {
  try {
    await fs.mkdirs(path);
    await fs.mkdirs(path + "\\assets\\music");
    await resetSettings();
    await resetFallbackPlaylist();
    await resetRequestPlaylist();
    await resetFFPlay();
    await resetFFPlayDependency();
    await resetServer();
  } catch (err) {
    console.error("Something went wrong installing the application. ERROR:");
    throw err;
  }
}

async function resetSettings() {
  try {
    console.log("Creating settings file");
    await fs.writeFile(
      path + "\\settings.json",
      JSON.stringify(defaultSettings, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the settings. ERROR:");
    throw err;
  }
}

async function resetRequestPlaylist() {
  try {
    console.log("Creating request playlist");
    await fs.writeFile(
      path + "\\assets\\requestPlaylist.json",
      JSON.stringify(requestPlaylist, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the playlist. ERROR:");
    throw err;
  }
}

async function resetFallbackPlaylist() {
  try {
    console.log("Creating fallback playlist");
    await fs.writeFile(
      path + "\\assets\\fallbackPlaylist.json",
      JSON.stringify(fallbackPlaylist, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the playlist. ERROR:");
    throw err;
  }
}

async function resetFFPlay() {
  try {
    console.log("Downloading ffplay");
    await download(
      "https://github.com/NUB31/twitch_musicbot/releases/download/asset/ffplay.exe",
      path + "\\assets"
    );
  } catch (err) {
    console.error("Something went wrong downloading ffplay. ERROR:");
    throw err;
  }
}

async function resetFFPlayDependency() {
  try {
    console.log("Downloading win32-x64_lib.node");
    await fs.remove("win32-x64_lib.node");
    await download(
      "https://github.com/NUB31/twitch_musicbot/releases/download/asset/win32-x64_lib.node",
      path
    );
  } catch (err) {
    console.error("Something went wrong downloading ffplay. ERROR:");
    throw err;
  }
}

async function resetServer() {
  try {
    console.log("Downloading main server file");
    await fs.remove("server.exe");
    await download(
      "https://github.com/nub31/twitch_musicbot/releases/latest/download/server.exe",
      path
    );
  } catch (err) {
    console.error("Something went wrong the server file. ERROR:");
    throw err;
  }
}

setup();
