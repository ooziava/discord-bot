import {
  playlist_info,
  search,
  spotify,
  SpotifyTrack,
  video_basic_info,
  YouTubeVideo,
} from "play-dl";
import { SourceEnum, type Source } from "../types/source.js";

class SearchService {
  static async searchSong(query: string, limit = 1) {
    return await search(query, {
      limit,
      unblurNSFWThumbnails: true,
    }).catch(() => null);
  }

  static async getSongByURL(url: string, options?: { source: Source }) {
    switch (options?.source) {
      case SourceEnum.Spotify:
        const sp = await spotify(url).catch(() => null);
        if (!(sp instanceof SpotifyTrack)) return;

        const videos = await this.searchSong(
          `${sp.name} ${sp.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
        );
        return videos?.[0];

      case SourceEnum.Youtube:
      default:
        const info = await video_basic_info(url).catch(() => null);
        return info?.video_details;
    }
  }

  static async getPlaylistByURL(url: string, options?: { source: Source }) {
    switch (options?.source) {
      case SourceEnum.Spotify: {
        const sp = await spotify(url).catch(() => null);
        if (!sp || sp instanceof SpotifyTrack) return;

        const tracks = await sp.all_tracks().catch(() => null);
        if (!tracks) return;

        const videos = await Promise.all(
          tracks.map(async (track) => {
            const videos = await this.searchSong(
              `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
            );
            return videos?.[0];
          })
        );
        return {
          info: sp,
          videos: videos.filter((video) => video) as YouTubeVideo[],
        };
      }
      case SourceEnum.Youtube:
      default:
        const playlist = await playlist_info(url, {
          incomplete: true,
        }).catch(() => null);
        if (!playlist) return;

        const videos = await playlist.all_videos().catch(() => null);
        if (!videos) return;

        return {
          info: playlist,
          videos,
        };
    }
  }
}

export default SearchService;
