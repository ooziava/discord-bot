const { search, playlist_info, stream, video_info } = require("play-dl");

module.exports = {
  async findYTVideo(query, info) {
    // Search for the video
    if (info === "search") {
      const [video] = await search(query, { limit: 1 });
      if (!video) throw new Error("No video found!");
      return { url: video.url, title: video.title };
    }

    if (info.includes("playlist")) {
      const musicList = await playlist_info(query, { incomplete: true });
      await musicList.fetch();
      if (!musicList.page(1)?.length) throw new Error("Playlist not found!");

      const [track] = musicList.page(1);
      const url = track?.url || query;
      const title = track?.title || query;
      return { url, title };
    } else {
      const video = await video_info(query, { incomplete: true });
      const title = video?.video_details?.title || query;
      const url = video?.video_details?.url || query;
      return { url, title };
    }
  },
};
