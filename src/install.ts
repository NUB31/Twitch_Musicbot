import defaultSettings from "./bundledAssets/settings.json";
import download from "download";
import fallbackPlaylist from "./bundledAssets/assets/fallbackPlaylist.json";
import fs from "fs-extra";
import requestPlaylist from "./bundledAssets/assets/requestPlaylist.json";

async function setup() {
  try {
    // Make assets folder if it does not already exists
    if (!(await fs.pathExists("assets"))) {
      await fs.mkdir("assets");
    }
    if (!(await fs.pathExists("assets/music"))) {
      await fs.mkdir("assets/music");
    }
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
    console.log("Resetting settings");
    await fs.remove("settings.json");
    await fs.writeFile(
      "settings.json",
      JSON.stringify(defaultSettings, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the settings. ERROR:");
    throw err;
  }
}

async function resetRequestPlaylist() {
  try {
    console.log("Resetting request playlist");
    await fs.remove("assets/requestPlaylist.json");
    await fs.writeFile(
      "assets/requestPlaylist.json",
      JSON.stringify(requestPlaylist, null, 2)
    );
  } catch (err) {
    console.error("Something went wrong resetting the playlist. ERROR:");
    throw err;
  }
}

async function resetFallbackPlaylist() {
  try {
    console.log("Resetting fallback playlist");
    await fs.remove("assets/fallbackPlaylist.json");
    await fs.writeFile(
      "assets/fallbackPlaylist.json",
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
    await fs.remove("assets/ffplay.exe");
    await download(
      "https://github.com/NUB31/twitch_musicbot/releases/download/asset/ffplay.exe",
      "assets"
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
      "./"
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
      "./"
    );
  } catch (err) {
    console.error("Something went wrong the server file. ERROR:");
    throw err;
  }
}

setup();
