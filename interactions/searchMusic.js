const { validate, is_expired, refreshToken } = require("play-dl");
const { findYTVideo } = require("./youtube");
const { findSOVideo } = require("./soundCoud");
const { findSPVideo } = require("./spotify");
const { saveTrack } = require("./saveTrack");

module.exports = {
  async searchMusic(query, guildId) {
    if (is_expired()) await refreshToken();

    // Validate the search query
    const info = await validate(query);
    if (!info) throw new Error("No video found!");

    let func;
    const [social, type] = info.split("_");
    switch (social) {
      case "yt":
        func = findYTVideo;
        break;
      case "search":
        func = findYTVideo;
        break;
      case "so":
        func = findSOVideo;
        break;
      case "sp":
        func = findSPVideo;
        break;
      default:
        throw new Error("No video found!");
    }
    const { url, title } = await func(query, info);
    await saveTrack(title, url, guildId);
  },
};
