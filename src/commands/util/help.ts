import { Message, SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";
import helpEmbed from "../../embeds/help.js";

export const data: Data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the bot")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("The command to get help with")
      .setRequired(false)
      .addChoices(
        { name: "play", value: "play" },
        { name: "search", value: "search" },
        { name: "kill", value: "kill" },
        { name: "queue", value: "queue" },
        { name: "playlist", value: "playlist" },
        { name: "next", value: "next" },
        { name: "pause", value: "pause" },
        { name: "loop", value: "loop" },
        { name: "volume", value: "volume" },
        { name: "prefix", value: "prefix" },
        { name: "info", value: "info" }
      )
  );

export const execute: Execute = async (_client, interaction, arg) => {
  await interaction.reply({
    embeds: [
      helpEmbed(
        interaction instanceof Message
          ? arg?.[0]
          : interaction.options.getString("command") ?? undefined
      ),
    ],
  });
};
