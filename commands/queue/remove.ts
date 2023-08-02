import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from "@discordjs/builders";
import {
  ButtonStyle,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Interaction,
} from "discord.js";
import { Command } from "interfaces/discordjs.js";
import { removeSongFromQueue } from "../../services/queue.js";

const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Removes a song from the queue")
  .addStringOption((option) =>
    option
      .setName("index")
      .setDescription("The index of the song to remove")
      .setRequired(true)
  );

const execute = async (interaction: CommandInteraction) => {
  const index = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("index")!;

  const confirm = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Confirm remove")
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId("cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    cancel,
    confirm
  );

  const response = await interaction.reply({
    content: "Are you sure you want to remove this song from the queue?",
    components: [row],
  });

  const collectorFilter = (i: Interaction): boolean =>
    i.user.id === interaction.user.id;

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: collectorFilter,
      time: 60_000,
    });

    if (confirmation.customId === "confirm") {
      const song = removeSongFromQueue(
        interaction.guildId!,
        parseInt(index) - 1
      );
      await confirmation.update({
        content: `Removed ${song.title} from the queue`,
        components: [],
      });
    } else if (confirmation.customId === "cancel") {
      await confirmation.update({
        content: "Action cancelled",
        components: [],
      });
    }
  } catch (e) {
    await interaction.editReply({
      content: "Confirmation not received within 1 minute, cancelling",
      components: [],
    });
  }
};

export const command: Command = {
  data,
  execute,
};
