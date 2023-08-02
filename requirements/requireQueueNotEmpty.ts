import { CommandInteraction } from "discord.js";
import { getQueue } from "../services/queue.js";

export default (interaction: CommandInteraction): boolean =>
  getQueue(interaction.guild!.id).songs.length > 0;
