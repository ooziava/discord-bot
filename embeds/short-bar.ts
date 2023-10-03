import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { add, more, next, pause, play, prev } from "../buttons.js";

export default (options?: { pause?: boolean }) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    prev,
    next,
    options?.pause ? play : pause,
    add,
    more,
  ]);
