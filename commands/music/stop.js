const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");
const opus = require("@discordjs/opus");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing a song in a voice chan"),
  async execute(interaction) {
    try {
      // Check if the user is in a voice channel
      const channel = interaction.member.voice.channel;
      if (!channel)
        return interaction.reply(
          "You need to be in a voice channel to use this command!"
        );

      // Get the voice connection
      const connection = getVoiceConnection(channel.guild.id);
      if (!connection) {
        return interaction.reply(
          "You need to be in a voice channel to use this command!"
        );
      }

      const player = createAudioPlayer();
      connection.subscribe(player);
      player.stop();
      await entersState(player, AudioPlayerStatus.Idle);
      await interaction.reply("Stopped!");
    } catch (error) {
      await interaction.reply("Error playing!");
      console.error(error);
    }
  },
};
