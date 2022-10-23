import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { getFallbackPlaylist, getRequestPlaylist, getSettings } from "./config";
import { resume, suspend } from "ntsuspend";

import { PlayStatus } from "../types/PlayStatus";
import { YoutubeVideo } from "../types/YoutubeVideo";
import downloadYoutubeVideo from "../helpers/downloadYoutubeVideo";
import fs from "fs-extra";

export let player: ChildProcessWithoutNullStreams;

export let fallbackPlaylist = getFallbackPlaylist();
export let requestPlaylist = getRequestPlaylist();
export let currentMusicStatus: PlayStatus = "ended";

export async function startMusicPlayer(): Promise<void> {
  // Load settings into settings variable
  const settings = getSettings();
  // Declare variables
  let music: YoutubeVideo;
  let isDefault = false;

  // Do not start if paused or if already playing
  if (currentMusicStatus === "paused") return console.warn("Music is paused");
  if (currentMusicStatus === "playing") return console.warn("Music is playing");

  // Play from request list if not empty, else play fallback list
  if (requestPlaylist.length >= 1) {
    music = requestPlaylist[0];
  } else if (fallbackPlaylist.length >= 1 && settings?.useDefaultPlaylist) {
    isDefault = true;
    music = fallbackPlaylist[0];
  } else {
    currentMusicStatus = "ended";
    return;
  }
  // Set status to playing to prevent duplicate players on two function calls in quick succession
  currentMusicStatus = "playing";

  // Look for the music in music folder and download if not already there
  if (!(await fs.pathExists(`assets/music/${music.id}.mp4`))) {
    try {
      if (music.duration < settings?.maxLength) {
        await downloadYoutubeVideo(music.id);
      } else {
        console.warn(
          `Video is above the maximum length of ${settings.maxLength}. You can change the length in settings.json`
        );
      }
    } catch (err) {
      console.warn(
        "Something is very wrong with this song, removing from playlist and skipping to next song"
      );
      requestPlaylist.shift();
      await fs.writeFile(
        "assets/requestPlaylist.json",
        JSON.stringify(requestPlaylist, null, 2)
      );
      // Restart of error occurs, remove song and restart
      currentMusicStatus = "ended";
      return startMusicPlayer();
    }
  }

  // At this point, the song is downloaded and ready to play
  await fs.writeFile("music_name.txt", `${music.title}`);
  await fs.writeFile("music_artist.txt", `${music.channelTitle}`);

  // Adjust args based on user settings
  // Initial array can be declared with variables that have two sections, such as  -y 300
  const playerArgs = [
    "-window_title",
    settings?.windowTitle,
    "-y",
    settings?.height,
    "-x",
    settings?.width,
    "-top",
    settings?.playerY,
    "-left",
    settings?.playerX,
  ];

  // Args that are alone cant be in the initial array. At least when i tried. Probably possible, im just to lazy to figure it out
  if (settings?.hidePreview) playerArgs.push("-nodisp");
  if (settings?.isBorderless) playerArgs.push("-noborder");

  player = spawn("assets/ffplay", [
    ...playerArgs,
    "-autoexit",
    "-showmode",
    "0",
    `assets/music/${music.id}.mp4`,
  ]);

  // This needs to be here to prevent crash
  player.stdout.on("data", (data) => {});
  player.stderr.on("data", (data) => {});

  // When song is finished or closed, go to next song or shuffle, then start player again
  player.on("exit", async () => {
    await fs.writeFile("music_name.txt", ``);
    await fs.writeFile("music_artist.txt", ``);

    await skipMusic();

    if (currentMusicStatus !== "paused") {
      currentMusicStatus = "ended";
    }
    startMusicPlayer();
  });
}

export async function skipMusic(): Promise<boolean> {
  const settings = getSettings();
  // Stop player if playing
  if (player?.pid) player.kill();

  if (requestPlaylist.length >= 1) {
    // Go to next song in request queue
    requestPlaylist.shift();
    await fs.writeFile(
      "assets/requestPlaylist.json",
      JSON.stringify(requestPlaylist, null, 2)
    );
  } else {
    // Shuffle songs by skipping through a random amount of songs
    const rand = settings?.shuffleDefaultPlaylist
      ? Math.floor(Math.random() * fallbackPlaylist.length)
      : // If shuffle is off, skip one
        1;
    for (let i = 0; i < rand; i++) {
      let currentSong = fallbackPlaylist.shift();
      if (currentSong) fallbackPlaylist.push(currentSong);
    }

    await fs.writeFile(
      "assets/fallbackPlaylist.json",
      JSON.stringify(fallbackPlaylist, null, 2)
    );
  }
  return true;
}

export function pauseMusic(): boolean {
  if (player?.pid) {
    if (!suspend(player.pid)) {
      console.log("Could not suspend process");
      return false;
    } else {
      currentMusicStatus = "paused";
      return true;
    }
  } else {
    currentMusicStatus = "paused";
    return true;
  }
}

export function resumeMusic(): boolean {
  if (currentMusicStatus === "paused") {
    currentMusicStatus = "ended";
  }
  if (player?.pid) {
    if (!resume(player.pid)) startMusicPlayer();
    currentMusicStatus = "playing";
    return true;
  } else {
    startMusicPlayer();
    return true;
  }
}

export async function addToRequestPlaylist(
  music: YoutubeVideo
): Promise<boolean> {
  try {
    requestPlaylist.push(music);
    await fs.writeFile(
      "assets/requestPlaylist.json",
      JSON.stringify(requestPlaylist, null, 2)
    );
    startMusicPlayer();
    return true;
  } catch (err) {
    console.log("error adding music to playlist, ERROR: ");
    console.error(err);
    return false;
  }
}

export async function addToDefaultPlaylist(
  music: YoutubeVideo
): Promise<boolean> {
  try {
    fallbackPlaylist.push(music);
    await fs.writeFile(
      "assets/fallbackPlaylist.json",
      JSON.stringify(fallbackPlaylist, null, 2)
    );
    console.log(currentMusicStatus);
    startMusicPlayer();
    return true;
  } catch (err) {
    console.log("error adding music to playlist, ERROR: ");
    console.error(err);
    return false;
  }
}

export function getCurrentPlayingSong(): YoutubeVideo {
  return requestPlaylist.length > 0
    ? requestPlaylist[0]
    : fallbackPlaylist.length > 0
    ? fallbackPlaylist[0]
    : { channelTitle: "Nothing", duration: 69, id: "1", title: "Nothing" };
}
