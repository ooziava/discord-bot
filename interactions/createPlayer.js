const { createAudioPlayer, NoSubscriberBehavior } = require("@discordjs/voice");

module.exports = {
  async createPlayer() {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
        maxMissedFrames: 2,
      },
    });

    // Error listener for audio player
    player.on("error", (error) => {
      console.error("Audio player error:", error);
    });

    player.on("idle", () => {
      console.log("Audio player is idle");
    });

    return player;
  },
};
