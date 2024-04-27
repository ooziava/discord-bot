import consola from "consola";
import {
  search,
  spotify,
  SpotifyTrack,
  playlist_info,
  video_basic_info,
  YouTubeVideo,
} from "play-dl";

import { SourceEnum } from "../types/source.js";
import { getPlaylistSource, getSongSource } from "../utils/urls.js";

export default class SearchService {
  static async searchSongs(query: string, limit = 1) {
    return await search(query, {
      limit,
      unblurNSFWThumbnails: true,
    }).catch((err) => {
      consola.error("Failed to search song: ", err);
      return null;
    });
  }

  static async getSongByURL(url: string) {
    const source = await getSongSource(url);
    switch (source) {
      case SourceEnum.Spotify:
        const sp = await spotify(url).catch((err) => {
          consola.error("Failed to fetch spotify song: ", err);
          return null;
        });
        if (!(sp instanceof SpotifyTrack)) return;

        const videos = await this.searchSongs(
          `${sp.name} ${sp.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
        );
        return videos?.[0];

      case SourceEnum.Youtube:
      default:
        const info = await video_basic_info(url).catch((err) => {
          consola.error("Failed to fetch youtube song: ", err);
          return null;
        });
        return info?.video_details;
    }
  }

  static async getPlaylistByURL(url: string) {
    const source = await getPlaylistSource(url);
    switch (source) {
      case SourceEnum.Spotify: {
        const sp = await spotify(url).catch((err) => {
          consola.error("Failed to fetch spotify playlist: ", err);
          return null;
        });
        if (!sp || sp instanceof SpotifyTrack) return;

        const tracks = await sp.all_tracks().catch((err) => {
          consola.error("Failed to fetch spotify tracks: ", err);
          return null;
        });
        if (!tracks) return;

        const videos: YouTubeVideo[] = [];

        for (let i = 0; i < tracks.length; i += 5) {
          const chunk = tracks.slice(i, i + 5);
          const queries = chunk.map(
            (track) =>
              `${track.name} ${track.artists.reduce((acc, cur) => acc + " " + cur.name, "")}`
          );
          const results = await Promise.all(queries.map((query) => this.searchSongs(query)));
          results.forEach((result) => {
            if (result && result.length) videos.push(result[0]);
          });
        }

        return {
          info: sp,
          videos,
        };
      }
      case SourceEnum.Youtube:
      default:
        const playlist = await playlist_info(url, {
          incomplete: true,
        }).catch((err) => {
          consola.error("Failed to fetch youtube playlist: ", err);
          return null;
        });
        if (!playlist) return;

        const videos = await playlist.all_videos().catch((err) => {
          consola.error("Failed to fetch youtube videos: ", err);
          return null;
        });
        if (!videos) return;

        return {
          info: playlist,
          videos,
        };
    }
  }
}
