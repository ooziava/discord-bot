import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from "@discordjs/builders";
import { ButtonStyle, CommandInteraction, Interaction } from "discord.js";
import { Command } from "interfaces/discordjs.js";
import { clearQueue } from "../../services/queue.js";

const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Clears the queue");
const execute = async (interaction: CommandInteraction) => {
  const confirm = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("Confirm clear")
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
    content: "Are you sure you want to clear the queue?",
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
      clearQueue(interaction.guildId!);
      await confirmation.update({
        content: "Queue cleared",
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
  reqiures: ["requireQueueNotEmpty"],
};
