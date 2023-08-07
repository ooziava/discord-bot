import {
  CommandInteraction,
  InteractionResponse,
  ButtonInteraction,
  ComponentType,
} from "discord.js";
import { userFilter } from "./collectorFilters.js";

type ConfirmCallback = (confirmation: ButtonInteraction) => Promise<void>;

const createConfirmation = async (
  interaction: CommandInteraction,
  response: InteractionResponse<boolean>,
  confirm: ConfirmCallback
): Promise<void> => {
  const { awaitMessageComponent } = response;
  try {
    const confirmation = (await awaitMessageComponent({
      filter: userFilter(interaction),
      time: 60000,
    })) as ButtonInteraction;
    switch (confirmation.customId) {
      case "confirm":
        await confirm(confirmation);
        break;
      case "cancel":
        await confirmation.update({
          content: "Action cancelled",
          components: [],
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
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
      switch (confirmation.customId) {
        case "prevPage":
          await prev(confirmation);
          break;
        case "nextPage":
          await next(confirmation);
          break;
        default:
          await confirmation.deferUpdate();
          break;
      }
      collector.resetTimer();
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: "Something went wrong!",
      components: [],
    });
  }
};

export { createConfirmation, createPagination };
