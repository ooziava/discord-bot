const { SlashCommandBuilder } = require("discord.js");
const {
  AudioPlayerStatus,
  entersState,
  createAudioResource,
} = require("@discordjs/voice");
const { join } = require("../../interactions/join");
const { createPlayer } = require("../../interactions/createPlayer");
const { searchMusic } = require("../../interactions/searchMusic");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in a voice channel!")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Enter Youtube URL or song name.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const connection = await join(interaction);

    try {
      const player = await createPlayer();
      connection.subscribe(player);
      await interaction.deferReply();
      const { source, title } = await searchMusic(prompt);
      const resource = createAudioResource(source.stream, {
        inputType: source.type,
      });
      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing);
      interaction.editReply(`Now playing: ${title}`);
    } catch (error) {
      console.error(error.message);
      interaction.editReply(`Song on request <${prompt}> not found!`);
    }
  },
};
