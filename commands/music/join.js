const { SlashCommandBuilder } = require("discord.js");
const { join } = require("../../interactions/join");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join the voice channel."),
  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel)
      return interaction.reply(
        "You need to be in a voice channel to use this command!"
      );
    let connection = getVoiceConnection(channel.guild.id);
    if (connection) {
      interaction.reply("I'm already in a voice channel!");
      return connection;
    }
    await join(interaction);
    interaction.reply("Bot has joined the voice channel.");
  },
};
