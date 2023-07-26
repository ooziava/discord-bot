const { search, playlist_info, stream, video_info } = require("play-dl");

module.exports = {
  async findYTVideo(query, info) {
    // Search for the video
    if (info === "search") {
      const videos = await search(query, { limit: 1 });
      if (!videos?.length) throw new Error("No video found!");
      const source = await stream(videos[0]?.url, { seek: 10 });
      return { source, title: videos[0]?.title };
    }

    let url,
      title = query;
    if (info.includes("playlist")) {
      const musicList = await playlist_info(query, { incomplete: true });
      if (!musicList?.videos?.length) throw new Error("No video found!");
      url = musicList.videos[0].url;
      title = musicList.videos[0].title;
    } else {
      const video = await video_info(query, { incomplete: true });
      if (video) title = video.video_details.title;
      url = query;
    }

    const resource = await stream(url, {
      quality: 2,
    });
    return { source: resource, title };
  },
};
