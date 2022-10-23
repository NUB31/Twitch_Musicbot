import {
  addToDefaultPlaylist,
  addToRequestPlaylist,
  currentMusicStatus,
  fallbackPlaylist,
  getCurrentPlayingSong,
  pauseMusic,
  requestPlaylist,
  resumeMusic,
  skipMusic,
  startMusicPlayer,
} from "./helpers/music";
import { searchForPlaylist, searchForVideo } from "./helpers/searchYoutube";

import { ResponseStatus } from "./types/ResponseStatus";
import { YoutubeVideo } from "./types/YoutubeVideo";
import { getSettings } from "./helpers/config";
import socket from "./helpers/socket";

if (getSettings().startPaused) pauseMusic();
startMusicPlayer();
main();

async function main() {
  socket.on("pause", (content, cb) => {
    cb({
      status: pauseMusic(),
    });
  });

  socket.on("resume", (content, cb) => {
    let res: ResponseStatus = { status: false };
    cb({
      message:
        currentMusicStatus === "playing" ? "Music already playing" : undefined,
      status: resumeMusic(),
    });
  });

  socket.on("add", async (content, cb) => {
    if (!content) {
      return cb({ message: "No song name provided", status: false });
    }

    let musics: YoutubeVideo[] = [];
    let result;

    try {
      result = await searchForVideo(content);
      if (result.length !== 0) {
        musics = [result[0]];
      } else {
        try {
          musics = await searchForPlaylist(content);
        } catch (err) {
          return cb({
            message: `Error searching for playlist, ERROR: ${err}`,
            status: false,
          });
        }
      }
    } catch (err) {
      return cb({
        message: `Error searching for video, ERROR: ${err}`,
        status: false,
      });
    }

    // If there are no search results, respond with the error
    if (musics.length === 0) {
      return cb({
        message: `Could not find ${content} on YouTube. Is the video/playlist private`,
        status: false,
      });
    }

    musics.forEach(async (music) => {
      // If Song is already in the playlist, there is no need to add it again
      if (fallbackPlaylist.filter((e) => e.id === music.id).length > 0) {
        return console.log("Already in queue");
      }

      // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
      await addToDefaultPlaylist(music);
    });

    return cb({
      message: `Added ${musics
        .map((music) => music.title)
        .join(", ")} to the fallback playlist`,
      status: true,
    });
  });

  socket.on("play", async (content, cb) => {
    // If message does not have some  content respond with proper usage
    if (!content) {
      return cb({
        message: `No title or url provided`,
        status: false,
      });
    }

    // Search for music matching name on YouTube
    let musics: YoutubeVideo[] = [];
    try {
      musics = await searchForVideo(content);
    } catch (err) {
      return cb({
        message: `No title or url provided, ERROR: ${err}`,
        status: false,
      });
    }

    // If there are no search results, respond with the error
    if (!(musics[0] && musics[0].id)) {
      return cb({
        message: `Could not find ${content} on YouTube`,
        status: false,
      });
    }

    // If Song is already in the queue, there is no need to add it again
    if (requestPlaylist.filter((e) => e.id === musics[0].id).length > 0) {
      return cb({
        message: `Already in queue`,
        status: false,
      });
    }

    // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
    return cb({
      message:
        currentMusicStatus === "paused"
          ? "Added to queue, however music is paused"
          : currentMusicStatus === "playing"
          ? `${musics[0].title} is next in queue`
          : currentMusicStatus === "ended"
          ? `${musics[0].title} is now playing`
          : undefined,
      status: await addToRequestPlaylist(musics[0]),
    });
  });

  socket.on("skip", async (content, cb) => {
    return cb({
      message: `Skipped ${getCurrentPlayingSong().title}`,
      status: await skipMusic(),
    });
  });
}
