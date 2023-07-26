const { search, playlist_info, stream, spotify } = require("play-dl");

module.exports = {
  async findSPVideo(query, type) {
    let url,
      title = query;
    if (type === "track") {
      const track = await spotify(query);
      if (!track) throw new Error("Track not found!");
      const { name, artists } = track;
      const prompt = `${name} ${artists.reduce(
        (acc, cur) => acc + " " + cur.name,
        ""
      )}`;

      const tracks = await search(prompt, {
        limit: 1,
      });
      if (!tracks.length) throw new Error("Track not found!");
      url = tracks[0].url;
      title = tracks[0].title;
    } else if (type === "playlist") {
      const playlists = await playlist_info(query, {
        limit: 1,
        source: { spotify: "playlist" },
      });
      console.log(playlists);
      url = videos[0].url;
      title = videos[0].title;
    } else throw new Error("Video not found!");

    const resource = await stream(url, {
      seek: 10,
      quality: 2,
    });
    return { source: resource, title };
  },
};
