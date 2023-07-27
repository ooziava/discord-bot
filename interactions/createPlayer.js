const {
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { stream } = require("play-dl");

module.exports = {
  async createPlayer(guildId) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
        maxMissedFrames: 2,
      },
    });

    // Error listener for audio player
    player.on("error", (error) => {
      console.error("Audio player error:", error);
      player.stop();
    });

    const queue = require("../queues/" + guildId + ".json");
    player.on(AudioPlayerStatus.Idle, async () => {
      console.log("Audio player is idle");
      if (queue.length > 0) {
        const url = queue[queue.length - 1].url;
        const str = await stream(url, {
          quality: 2,
          discordPlayerCompatibility: true,
        });
        const resource = createAudioResource(str.stream, {
          inputType: str.type,
        });
        player.play(resource);
      }
    });

    if (queue.length > 0) {
      const url = queue[queue.length - 1].url;
      const str = await stream(url, {
        quality: 2,
        discordPlayerCompatibility: true,
      });
      const resource = createAudioResource(str.stream, {
        inputType: str.type,
      });
      player.play(resource);
    }
    return player;
  },
};
