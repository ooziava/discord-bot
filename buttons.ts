import { ButtonBuilder, ButtonStyle } from "discord.js";

export const prev = new ButtonBuilder()
  .setCustomId("prev")
  .setLabel("Prev")
  .setStyle(ButtonStyle.Primary);

export const next = new ButtonBuilder()
  .setCustomId("next")
  .setLabel("Next")
  .setStyle(ButtonStyle.Primary);

export const play = new ButtonBuilder()
  .setCustomId("play")
  .setLabel("Play")
  .setStyle(ButtonStyle.Success);

export const pause = new ButtonBuilder()
  .setCustomId("pause")
  .setLabel("Pause")
  .setStyle(ButtonStyle.Secondary);

export const add = new ButtonBuilder()
  .setCustomId("add")
  .setLabel("Add")
  .setStyle(ButtonStyle.Secondary);

export const index = new ButtonBuilder()
  .setCustomId("index")
  .setLabel("Index")
  .setStyle(ButtonStyle.Primary);

export const shuffle = new ButtonBuilder()
  .setCustomId("shuffle")
  .setLabel("Shuffle")
  .setStyle(ButtonStyle.Primary);

export const remove = new ButtonBuilder()
  .setCustomId("remove")
  .setLabel("Remove")
  .setStyle(ButtonStyle.Danger);

export const kill = new ButtonBuilder()
  .setCustomId("kill")
  .setLabel("Kill")
  .setStyle(ButtonStyle.Danger);

export const hide = new ButtonBuilder()
  .setCustomId("hide")
  .setLabel("Hide")
  .setStyle(ButtonStyle.Secondary);

export const more = new ButtonBuilder()
  .setCustomId("more")
  .setLabel("More")
  .setStyle(ButtonStyle.Secondary);
