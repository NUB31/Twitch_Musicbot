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
export let currentPlayingSong: YoutubeVideo = {
  channelTitle: "None",
  duration: 0,
  id: "69420",
  title: "Nothing",
};

export async function startMusicPlayer(): Promise<void> {
  const settings = getSettings();

  let music: YoutubeVideo;
  let isDefault = false;

  if (currentMusicStatus === "paused") {
    return console.log("Music is paused");
  }
  if (currentMusicStatus === "playing") {
    return console.log("Music is already playing");
  }
  if (requestPlaylist.length >= 1) {
    music = requestPlaylist[0];
  } else if (fallbackPlaylist.length >= 1 && settings?.useDefaultPlaylist) {
    isDefault = true;
    music = fallbackPlaylist[0];
  } else {
    currentMusicStatus = "ended";
    return;
  }
  currentMusicStatus = "playing";

  if (!(await fs.pathExists(`assets/music/${music.id}.mp4`))) {
    try {
      if (music.duration < settings?.maxLength) {
        await downloadYoutubeVideo(music.id);
      }
    } catch (err) {
      requestPlaylist.shift();
      await fs.writeFile(
        "assets/requestPlaylist.json",
        JSON.stringify(requestPlaylist, null, 4)
      );
      // Restart of error occurs, remove song and restart
      currentMusicStatus = "ended";

      startMusicPlayer();
      return;
    }
  }

  await fs.writeFile("music_name.txt", `${music.title}`);
  await fs.writeFile("music_artist.txt", `${music.channelTitle}`);

  currentPlayingSong = music;

  const playerArgs = [
    "-window_title",
    settings?.windowTitle,
    "-y",
    settings?.height,
    "-x",
    settings?.width,
  ];

  if (settings?.hidePreview) playerArgs.push("-nodisp");
  if (settings?.isBorderless) playerArgs.push("-noborder");

  player = spawn("assets/ffplay", [
    ...playerArgs,
    "-autoexit",
    "-top",
    settings?.playerY,
    "-left",
    settings?.playerX,
    "-showmode",
    "0",

    `assets/music/${music.id}.mp4`,
  ]);

  player.stdout.on("data", (data) => {});
  player.stderr.on("data", (data) => {});

  player.on("exit", async () => {
    await fs.writeFile("music_name.txt", ``);
    await fs.writeFile("music_artist.txt", ``);
    if (isDefault) {
      // Shuffle songs by skipping through a random amount of songs
      const rand = settings?.shuffleDefaultPlaylist
        ? Math.floor(Math.random() * fallbackPlaylist.length)
        : // If shuffle is off, skip one
          1;
      for (let index = 0; index < rand; index++) {
        let currentSong = fallbackPlaylist.shift();
        if (currentSong) {
          fallbackPlaylist.push(currentSong);
        }
      }

      await fs.writeFile(
        "assets/fallbackPlaylist.json",
        JSON.stringify(fallbackPlaylist, null, 4)
      );
    } else {
      // Go to next song in request queue
      requestPlaylist.shift();
      await fs.writeFile(
        "assets/requestPlaylist.json",
        JSON.stringify(requestPlaylist, null, 4)
      );
    }
    if (currentMusicStatus !== "paused") {
      currentMusicStatus = "ended";
    }
    startMusicPlayer();
  });
}

export async function addToMusicQueue(music: YoutubeVideo) {
  requestPlaylist.push(music);
  await fs.writeFile(
    "assets/requestPlaylist.json",
    JSON.stringify(requestPlaylist, null, 4)
  );
  startMusicPlayer();
}

export function skipMusic() {
  if (player) {
    player.kill();
  } else {
    requestPlaylist.shift();
  }
}

export function pauseMusic() {
  if (currentMusicStatus === "playing") {
  }
  currentMusicStatus = "paused";

  if (player?.pid) {
    if (!suspend(player.pid)) console.log("Could not suspend process");
  }
}

export function resumeMusic() {
  if (currentMusicStatus === "paused") {
    currentMusicStatus = "ended";
  }
  if (player?.pid) {
    if (!resume(player.pid)) return startMusicPlayer();
    currentMusicStatus = "playing";
  } else {
    startMusicPlayer();
  }
}

export async function addToDefaultPlaylist(music: YoutubeVideo) {
  fallbackPlaylist.push(music);
  await fs.writeFile(
    "assets/fallbackPlaylist.json",
    JSON.stringify(fallbackPlaylist, null, 4)
  );
  startMusicPlayer();
}
