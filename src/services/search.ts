import { playlist_info, search, video_basic_info } from "play-dl";
import type { Source } from "../types/source.js";

class SearchService {
  static async searchSong(query: string, limit = 1) {
    return await search(query, {
      limit,
      unblurNSFWThumbnails: true,
    }).catch(() => null);
  }

  static async getSongByURL(url: string, options?: { source: Source }) {
    switch (options?.source) {
      case "youtube":
      default:
        const info = await video_basic_info(url).catch(() => null);
        return info?.video_details;
    }
  }

  static async getPlaylistByURL(url: string, options?: { source: Source }) {
    switch (options?.source) {
      case "youtube":
      default:
        return await playlist_info(url, {
          incomplete: true,
        }).catch(() => null);
    }
  }
}

export default SearchService;
