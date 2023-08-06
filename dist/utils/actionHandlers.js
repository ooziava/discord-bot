import { ComponentType, } from "discord.js";
import { userFilter } from "./collectorFilters.js";
const createConfirmarion = async (interaction, response, confirm) => {
    try {
        const confirmation = await response.awaitMessageComponent({
            filter: userFilter(interaction),
            time: 60000,
        });
        if (confirmation.customId === "confirm") {
            await confirm(confirmation);
        }
        else if (confirmation.customId === "cancel") {
            await confirmation.update({
                content: "Action cancelled",
                components: [],
            });
        }
    }
    catch (e) {
        await interaction.editReply({
            content: "Confirmation not received within 1 minute, cancelling",
            components: [],
        });
    }
};
const createPagination = async (interaction, response, next, prev) => {
    try {
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000,
        });
        collector.on("collect", async (confirmation) => {
            if (confirmation.customId === "prevPage") {
                await prev(confirmation);
            }
            else if (confirmation.customId === "nextPage") {
                await next(confirmation);
            }
            else
                await confirmation.deferUpdate();
            collector.resetTimer();
        });
    }
    catch (e) {
        await interaction.editReply({
            content: "Something went wrong!",
            components: [],
        });
    }
};
export { createConfirmarion, createPagination };
