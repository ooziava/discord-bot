const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  entersState,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in a voice channel!")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Enter url or song name.")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const channel = interaction.member.voice.channel;
      const prompt = interaction.options.getString("prompt");
      if (!channel)
        return interaction.reply(
          "You need to be in a voice channel to use this command!"
        );
      if (!prompt)
        return interaction.reply("You need to provide a song to play!");
      let connection = getVoiceConnection(channel.guild.id);
      if (!connection) {
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
      }
      let resource;
      const player = createAudioPlayer();
      connection.subscribe(player);
      if (prompt.includes("youtube.com") || prompt.includes("youtu.be")) {
        const stream = ytdl(prompt, { filter: "audioonly" });
        resource = createAudioResource(stream);
      } else resource = createAudioResource(prompt);
      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing, 5e3);
      await interaction.reply("Playing!");
    } catch (error) {
      await interaction.reply("Error playing!");
      console.error(error);
    }
  },
};
