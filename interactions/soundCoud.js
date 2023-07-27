const { soundcloud } = require("play-dl");

module.exports = {
  async findSOVideo(query, info) {
    const type = info.split("_")[1];
    const res = await soundcloud(query);
    let url = res.url;
    let title = res.name;

    if (type === "playlist") {
      const track = await res.tracks[0];
      title = track?.name || title;
      url = track?.url || url;
    } else if (type !== "track") {
      throw new Error("Video not found!");
    }

    return { url, title };
  },
};
