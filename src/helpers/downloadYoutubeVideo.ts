import fs from "fs-extra";
import ytdl from "ytdl-core";

// Check if video is already downloaded. If not, download it
export default function downloadYoutubeVideo(videoId: string) {
  return new Promise(async (resolve, reject) => {
    if (!(await fs.pathExists(`music/${videoId}.mp4`))) {
      const stream = ytdl(`http://www.youtube.com/watch?v=${videoId}`, {
        filter: "audioandvideo",
      });
      stream.pipe(fs.createWriteStream(`assets/music/${videoId}.mp4`));
      stream.on("error", () => {
        return reject("something went wrong downloading video");
      });
      stream.on("finish", () => {
        return resolve(true);
      });
    } else {
      return resolve(true);
    }
  });
}
