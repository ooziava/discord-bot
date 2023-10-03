import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { more, next, pause, play, remove } from "../buttons.js";

export default (options?: { pause?: boolean }) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    next,
    options?.pause ? play : pause,
    remove,
    more,
  ]);
