import { YoutubeVideo } from "../types/YoutubeVideo";
import axios from "axios";
import { getSettings } from "./config";
import isValidUrl from "./isValidUrl";
import moment from "moment";
import search from "youtube-search";

export async function searchForVideo(query: string): Promise<YoutubeVideo[]> {
  const settings = getSettings();
  return new Promise(async (resolve, reject) => {
    try {
      await search(
        query,
        {
          maxResults: 2,
          key: settings.YOUTUBE_API_KEY,
          type: "video",
        },
        async (err, results) => {
          if (err) {
            console.error(err);
            return reject();
          }
          if (results?.length === 0 || !results) return resolve([]);

          const result = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos`,
            {
              params: {
                part: "contentDetails,snippet",
                maxResults: 1,
                key: settings.YOUTUBE_API_KEY,
                id: results[0].id,
              },
            }
          );

          return resolve(
            result.data.items.map((video: any) => {
              return {
                id: video.id || "",
                channelTitle: video.snippet.channelTitle || "",
                title: video.snippet.title || "",
                duration:
                  moment.duration(video.contentDetails.duration).asSeconds() ||
                  0,
              };
            })
          );
        }
      );
    } catch (err: any) {
      console.error(err.response);
      return reject(err);
    }
  });
}

export async function searchForPlaylist(url: string): Promise<YoutubeVideo[]> {
  const settings = getSettings();
  return new Promise(async (resolve, reject) => {
    if (!isValidUrl(url)) {
      console.error("not valid url");
      return resolve([]);
    }

    if (url.includes("?list=")) {
      url = url.split("?list=")[url.split("?list=").length - 1];
    }

    try {
      const playlist = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems`,
        {
          params: {
            part: "snippet,id",
            playlistId: url,
            maxResults: 50,
            key: settings.YOUTUBE_API_KEY,
          },
        }
      );

      const result = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: "contentDetails,snippet",
            maxResults: 50,
            key: settings.YOUTUBE_API_KEY,
            id: playlist.data.items
              .filter((video: any) => video.snippet.title !== "Deleted video")
              .map((video: any) => video.snippet.resourceId.videoId)
              .join(","),
          },
        }
      );

      return resolve(
        result.data.items.map((video: any) => {
          return {
            id: video.id || "",
            channelTitle: video.snippet.channelTitle || "",
            title: video.snippet.title || "",
            duration:
              moment.duration(video.contentDetails.duration).asSeconds() || 0,
          };
        })
      );
    } catch (err: any) {
      console.error(err.response);
      return reject(err);
    }
  });
}
