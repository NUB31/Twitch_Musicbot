import { Settings } from "../types/Settings";
import { YoutubeVideo } from "../types/YoutubeVideo";
import fs from "fs-extra";

export function getSettings(): Settings {
  try {
    return fs.readJsonSync("settings.json");
  } catch (err) {
    console.error("Something went wrong loading the settings. ERROR:");
    throw err;
  }
}

export function getFallbackPlaylist(): YoutubeVideo[] {
  try {
    return fs.readJsonSync("assets/fallbackPlaylist.json");
  } catch (err) {
    console.error("Something went wrong loading the settings. ERROR:");
    throw err;
  }
}

export function getRequestPlaylist(): YoutubeVideo[] {
  try {
    return fs.readJsonSync("assets/requestPlaylist.json");
  } catch (err) {
    console.error("Something went wrong loading the settings. ERROR:");
    throw err;
  }
}
