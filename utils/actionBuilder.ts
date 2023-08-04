import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

const confirmationRow = (): ActionRowBuilder<ButtonBuilder> => {
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

  return row;
};

const paginationRow = (): ActionRowBuilder<ButtonBuilder> => {
  const previous = new ButtonBuilder()
    .setCustomId("prev")
    .setLabel("Prev")
    .setStyle(ButtonStyle.Primary);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    previous,
    next
  );

  return row;
};

const playerRow = (): ActionRowBuilder<ButtonBuilder> => {
  const prev = new ButtonBuilder()
    .setCustomId("prev")
    .setLabel("Prev")
    .setStyle(ButtonStyle.Primary);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setLabel("Next")
    .setStyle(ButtonStyle.Primary);
  const pause = new ButtonBuilder()
    .setCustomId("pause")
    .setLabel("Pause")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prev,
    pause,
    next
  );

  return row;
};

export { confirmationRow, paginationRow, playerRow };
