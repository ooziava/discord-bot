import consola from "consola";
import { search, spotify, SpotifyTrack, playlist_info, video_basic_info } from "play-dl";

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

        const videos = [];

        for (let i = 0; i < tracks.length; i += 2) {
          const [res1, res2] = await Promise.all([
            this.searchSongs(
              `${tracks[i].name} ${tracks[i].artists.reduce(
                (acc, cur) => acc + " " + cur.name,
                ""
              )}`
            ),
            this.searchSongs(
              `${tracks[i + 1].name} ${tracks[i + 1].artists.reduce(
                (acc, cur) => acc + " " + cur.name,
                ""
              )}`
            ),
          ]);

          if (res1 && res1.length) videos.push(res1[0]);
          if (res2 && res2.length) videos.push(res2[0]);
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
