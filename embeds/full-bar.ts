import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { hide, index, kill, remove, shuffle } from "../buttons.js";

export default (options?: { pause?: boolean }) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([index, shuffle, remove, kill, hide]);
