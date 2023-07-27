const { stream, soundcloud } = require("play-dl");

module.exports = {
  async findSOVideo(query, type) {
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

    const resource = await stream(url, { quality: 2 });
    return { source: resource, title };
  },
};
