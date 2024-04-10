import { YouTubeVideo, search } from "play-dl";
import type { NewSong } from "../types/song.js";
import { SourceEnum } from "../types/source.js";

export default class SearchService {
  static async search(query: string) {
    return await search(query, {
      limit: 1,
      unblurNSFWThumbnails: true,
    });
  }

  static youtubeVideoToSong(video: YouTubeVideo): NewSong {
    return {
      title: video.title || "Unknown title",
      url: video.url,
      thumbnail: video.thumbnails[0].url,
      duration: video.durationInSec,
      artist: video.channel?.name || "Unknown artist",
      source: SourceEnum.Youtube,
    };
  }
}
