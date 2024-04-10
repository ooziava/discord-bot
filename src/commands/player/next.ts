import { SlashCommandBuilder, type ChatInputCommandInteraction, Message } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("next")
  .setDescription("Play the next song")
  .addIntegerOption((option) =>
    option.setName("amount").setDescription("The amount of songs to skip")
  );

export const execute = async (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => {
  const amount =
    interaction instanceof Message
      ? parseInt(args?.[0] ?? "1")
      : interaction.options.getInteger("amount") ?? 1;
  await interaction.reply(`Playing the next ${amount} songs`);
};
