import defaultSettings from "../bundledAssets/settings.json";
import fallbackPlaylist from "../bundledAssets/assets/fallbackPlaylist.json";
import fs from "fs-extra";
import installCheck from "../bundledAssets/assets/installCheck.json";
import requestPlaylist from "../bundledAssets/assets/requestPlaylist.json";

type SetupOptions = {
  resetList: {
    settings?: boolean;
    requestPlaylist?: boolean;
    fallbackPlaylist?: boolean;
  };
};

export default async function setup(options: Partial<SetupOptions> = {}) {
  try {
    // Make assets folder if it does not already exists
    if (!(await fs.pathExists("assets"))) {
      await fs.mkdir("assets");
    }

    if (options?.resetList?.settings || !(await fs.pathExists("settings.json")))
      await resetSettings();
    if (
      options?.resetList?.fallbackPlaylist ||
      !(await fs.pathExists("assets/fallbackPlaylist.json"))
    )
      await resetFallbackPlaylist();
    if (
      options?.resetList?.requestPlaylist ||
      !(await fs.pathExists("assets/requestPlaylist.json"))
    )
      await resetRequestPlaylist();

    // Static
    await fs.remove("assets/installCheck.json");
    await fs.writeFile(
      "assets/installCheck.json",
      JSON.stringify(installCheck, null, 4)
    );
  } catch (err) {
    console.error("Something went wrong installing the application. ERROR:");
    throw err;
  }
}

export async function resetSettings() {
  try {
    console.log("Resetting settings");
    await fs.remove("settings.json");
    await fs.writeFile(
      "settings.json",
      JSON.stringify(defaultSettings, null, 4)
    );
  } catch (err) {
    console.error("Something went wrong resetting the settings. ERROR:");
    throw err;
  }
}

export async function resetRequestPlaylist() {
  try {
    console.log("Resetting request playlist");
    await fs.remove("assets/requestPlaylist.json");
    await fs.writeFile(
      "assets/requestPlaylist.json",
      JSON.stringify(requestPlaylist, null, 4)
    );
  } catch (err) {
    console.error("Something went wrong resetting the playlist. ERROR:");
    throw err;
  }
}

export async function resetFallbackPlaylist() {
  try {
    console.log("Resetting fallback playlist");
    await fs.remove("assets/fallbackPlaylist.json");
    await fs.writeFile(
      "assets/fallbackPlaylist.json",
      JSON.stringify(fallbackPlaylist, null, 4)
    );
  } catch (err) {
    console.error("Something went wrong resetting the playlist. ERROR:");
    throw err;
  }
}
