import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder } from "discord.js";
import { hide, kill, next, pause, play, prev, remove } from "../buttons.js";

export default (options?: { pause?: boolean }) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    prev,
    next,
    options?.pause ? play : pause,
    kill,
    hide,
  ]);
