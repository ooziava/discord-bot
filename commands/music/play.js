const { SlashCommandBuilder } = require("discord.js");
const {
  AudioPlayerStatus,
  entersState,
  createAudioResource,
} = require("@discordjs/voice");
const { join } = require("../../interactions/join");
const { createPlayer } = require("../../interactions/createPlayer");
const { searchMusic } = require("../../interactions/searchMusic");
const { saveTrack } = require("../../interactions/saveTrack");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in a voice channel!")
    .addStringOption((option) =>
      option.setName("prompt").setDescription("Enter Youtube URL or song name.")
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const connection = await join(interaction);

    try {
      await interaction.deferReply();
      if (prompt) await searchMusic(prompt, interaction.guildId);
      const player = await createPlayer(connection, interaction.guildId);
      await interaction.editReply(`Song added to queue!`);
    } catch (error) {
      console.error(error.message);
      interaction.editReply(`Song on request <${prompt}> not found!`);
    }
  },
};
