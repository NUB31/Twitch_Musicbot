import { Settings } from "../types/Settings";
import fs from "fs-extra";

export default function getSettings(): Settings {
  try {
    return fs.readJsonSync("settings.json");
  } catch (err) {
    console.error("Something went wrong loading the settings. ERROR:");
    throw err;
  }
}
