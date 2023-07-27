const { search, spotify } = require("play-dl");

module.exports = {
  async findSPVideo(query, info) {
    const type = info.split("_")[1];
    const res = await spotify(query);
    let url = res.url,
      title = res.name,
      prompt = query;

    if (type === "track") {
      const { name, artists } = res;
      prompt = `${name} ${artists?.reduce(
        (acc, cur) => acc + " " + cur.name,
        ""
      )}`;
    } else if (type === "playlist") {
      await res.fetch();
      if (!res.page(1)?.length) throw new Error("Playlist not found!");

      const { name, artists } = await res.page(1)[0];
      prompt = `${name} ${artists?.reduce(
        (acc, cur) => acc + " " + cur.name,
        ""
      )}`;
    } else {
      throw new Error("Video not found!");
    }
    const tracks = await search(prompt, {
      limit: 1,
    });
    if (!tracks.length) throw new Error("Track not found!");
    url = tracks[0]?.url || url;
    title = tracks[0]?.title || title;
    return { url, title };
  },
};
