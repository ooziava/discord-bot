const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel."),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      connection.destroy();
      await interaction.reply("Bot has left the voice channel.");
    } else await interaction.reply("I'm not in a voice channel!");
  },
};
