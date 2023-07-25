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
      // Check if the user is in a voice channel
      const channel = interaction.member.voice.channel;
      if (!channel)
        return interaction.reply(
          "You need to be in a voice channel to use this command!"
        );

      // Check if a song was provided
      const prompt = interaction.options.getString("prompt");
      if (!prompt)
        return interaction.reply("You need to provide a song or url to play!");

      // Get the voice connection
      let connection = getVoiceConnection(channel.guild.id);
      if (!connection)
        connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

      let resource;
      const player = createAudioPlayer();
      connection.subscribe(player);

      // Check if the song is a youtube link
      if (prompt.includes("youtube.com") || prompt.includes("youtu.be"))
        resource = createAudioResource(
          ytdl(prompt, { filter: "audioonly", quality: "highestaudio" })
        );
      else resource = createAudioResource(stream);
      if (!resource) return interaction.reply("Video not found!");

      // Play the song
      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing);
      await interaction.reply("Playing!");
    } catch (error) {
      await interaction.reply("Error playing!");
      console.error(error);
    }
  },
};
