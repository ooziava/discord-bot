const { validate, is_expired, refreshToken } = require("play-dl");
const { findYTVideo } = require("./youtube");
const { findSOVideo } = require("./soundCoud");
const { findSPVideo } = require("./spotify");

const sites = [
  { name: "so_playlist", source: { soundcloud: "playlist" } },
  { name: "so_track", source: { soundcloud: "track" } },
  { name: "sp_track", source: { spotify: "track" } },
  { name: "sp_album", source: { spotify: "album" } },
  { name: "sp_playlist", source: { spotify: "playlist" } },
  { name: "dz_track", source: { deezer: "track" } },
  { name: "dz_playlist", source: { deezer: "playlist" } },
  { name: "dz_album", source: { deezer: "album" } },
  { name: "yt_video", source: { youtube: "video" } },
  { name: "yt_playlist", source: { youtube: "playlist" } },
];
module.exports = {
  async searchMusic(query) {
    if (is_expired()) {
      await refreshToken();
    }
    // Validate the search query
    const info = await validate(query);
    if (!info) throw new Error("No video found!");

    const [social, type] = info.split("_");
    switch (social) {
      case "yt":
        return await findYTVideo(query, info);
      case "search":
        return await findYTVideo(query, info);
      case "so":
        return await findSOVideo(query, type);
      case "sp":
        return await findSPVideo(query, type);
      default:
        throw new Error("No video found!");
    }
  },
};
