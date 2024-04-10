import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("prefix")
  .setDescription("Change the prefix")
  .addStringOption((option) =>
    option.setName("prefix").setDescription("The new prefix").setRequired(true)
  );
export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  let prefix;
  if (interaction instanceof Message) {
    prefix = args?.[0];
    if (!prefix) return await interaction.reply("Please provide a prefix.");
  } else {
    prefix = interaction.options.getString("prefix", true);
  }
  await interaction.reply(`Setting prefix to ${prefix}`);
};
