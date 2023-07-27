const {
  VoiceConnectionStatus,
  joinVoiceChannel,
  AudioPlayerStatus,
} = require("@discordjs/voice");

module.exports = {
  async join(interaction) {
    const channel = interaction.member.voice.channel;
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(AudioPlayerStatus.Paused, () => {
      console.log("Audio player was automatically paused");
    });

    connection.on(VoiceConnectionStatus.Signalling, () => {
      console.log(
        "The connection is now connecting to the voice channel - preparing to send audio!"
      );
    });
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        "The connection has entered the Ready state - ready to play audio!"
      );
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log(
        "The connection has entered a disconnected state - audio will stop playing!"
      );
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log(
        "The connection has entered a destroyed state - this is terminal!"
      );
    });

    connection.on("error", (error) => {
      console.error(error);
    });

    connection.on("stateChange", (oldState, newState) => {
      console.log(
        `Connection transitioned from ${oldState.status} to ${newState.status}`
      );
    });

    return connection;
  },
};
