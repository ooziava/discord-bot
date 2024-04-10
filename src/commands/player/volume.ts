import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("Set the volume of the player")
  .addIntegerOption((option) =>
    option.setName("volume").setDescription("The volume to set").setRequired(true)
  );

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  let volume;
  if (interaction instanceof Message) {
    const volumeArg = args?.[0];
    if (!volumeArg) return await interaction.reply("Please provide a volume.");
    volume = parseInt(volumeArg);
  } else {
    volume = interaction.options.getInteger("volume", true);
  }
  await interaction.reply(`Setting volume to ${volume}`);
};
