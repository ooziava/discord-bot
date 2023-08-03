import {
  CommandInteraction,
  InteractionResponse,
  ButtonInteraction,
  ComponentType,
} from "discord.js";
import { userFilter } from "./collectorFilters.js";

type ConfirmCallback = (confirmation: ButtonInteraction) => Promise<void>;

const createConfirmarion = async (
  interaction: CommandInteraction,
  response: InteractionResponse<boolean>,
  confirm: ConfirmCallback
): Promise<void> => {
  try {
    const confirmation = await response.awaitMessageComponent({
      filter: userFilter(interaction),
      time: 60000,
    });
    if (confirmation.customId === "confirm") {
      await confirm(confirmation as ButtonInteraction);
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

const createPagination = async (
  interaction: CommandInteraction,
  response: InteractionResponse<boolean>,
  next: ConfirmCallback,
  prev: ConfirmCallback
): Promise<void> => {
  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });
    collector.on("collect", async (confirmation) => {
      if (confirmation.customId === "prev") {
        await prev(confirmation);
      } else if (confirmation.customId === "next") {
        await next(confirmation);
      }
    });
  } catch (e) {
    await interaction.editReply({
      content: "Something went wrong!",
      components: [],
    });
  }
};
export { createConfirmarion, createPagination };
