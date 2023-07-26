const { search, playlist_info, stream } = require("play-dl");

module.exports = {
  async findSPVideo(query, type) {
    let url,
      title = query;
    if (info.includes("playlist")) {
      const musicList = await playlist_info(query, { incomplete: true });
      if (!musicList?.videos?.length) throw new Error("No video found!");
      url = musicList.videos[0].url;
      title = musicList.videos[0].title;
    } else {
      const musicList = await search(query, {
        limit: 1,
        source: { youtube: "video" },
      });
      if (!musicList.length) throw new Error("No video found!");
      url = musicList[0].url;
      title = musicList[0].title;
    }

    const resource = await stream(url, {
      seek: 10,
      quality: 2,
    });
    return { source: resource, title };
  },
};
