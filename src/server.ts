import {
  addToDefaultPlaylist,
  addToMusicQueue,
  fallbackPlaylist,
  pauseMusic,
  requestPlaylist,
  resumeMusic,
  skipMusic,
  startMusicPlayer,
} from "./helpers/music";
import io, { startServer } from "./helpers/socket";
import { searchForPlaylist, searchForVideo } from "./helpers/searchYoutube";

import { YoutubeVideo } from "./types/YoutubeVideo";
import { getSettings } from "./helpers/config";
import setup from "./helpers/setup";

setup().then(() => {
  console.log("Setup done, starting server");
  startServer();
  if (!getSettings().startPaused) startMusicPlayer();
  main();
});

async function main() {
  io.on("connection", (socket) => {
    socket.on("pause", () => {
      pauseMusic();
    });

    socket.on("resume", () => {
      resumeMusic();
    });

    socket.on("add", async (content) => {
      if (!content) {
        return console.log("No song name provided");
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
            return console.error(err);
          }
        }
      } catch (err) {
        return console.error(err);
      }

      // If there are no search results, respond with the error
      if (musics.length === 0) {
        console.log(
          `Could not find ${content} on YouTube. Is the video/playlist private?`
        );
      }

      musics.forEach(async (music) => {
        // If Song is already in the playlist, there is no need to add it again
        if (fallbackPlaylist.filter((e) => e.id === music.id).length > 0) {
          return console.log(`Already in queue`);
        }

        // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
        await addToDefaultPlaylist(music);
      });
    });

    socket.on("play", async (content) => {
      // If message does not have some content respond with proper usage
      if (!content) {
        return console.log("No song name provided");
      }

      // Search for music matching name on YouTube
      let musics = await searchForVideo(content);

      // If there are no search results, respond with the error
      if (!(musics[0] && musics[0].id)) {
        return console.log(`Could not find ${content} on YouTube`);
      }

      // If Song is already in the queue, there is no need to add it again
      if (requestPlaylist.filter((e) => e.id === musics[0].id).length > 0) {
        return console.log(`${musics[0].title} by ${musics[0].channelTitle}
          )} already exists in queue! Current position: ${requestPlaylist
            .map((e) => e.id)
            .indexOf(musics[0].id)}`);
      }

      // Add the video to the queue after the vid is downloaded (else there could be a problem with playing a non downloaded song)
      addToMusicQueue(musics[0]);
    });

    socket.on("skip", () => {
      skipMusic();
    });
  });
}
