import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from "discord.js";

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
    .setCustomId("prevPage")
    .setLabel("Prev")
    .setStyle(ButtonStyle.Primary);

  const next = new ButtonBuilder()
    .setCustomId("nextPage")
    .setLabel("Next")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    previous,
    next
  );

  return row;
};

const playerRow = (
  paused?: boolean
): ActionRowBuilder<MessageActionRowComponentBuilder> => {
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
    .setLabel(paused ? "Resume" : "Pause")
    .setStyle(ButtonStyle.Success);
  const stop = new ButtonBuilder()
    .setCustomId("stop")
    .setLabel("Kill")
    .setStyle(ButtonStyle.Danger);
  const options = new ButtonBuilder()
    .setCustomId("options")
    .setLabel("Options")
    .setStyle(ButtonStyle.Secondary);

  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      prev,
      pause,
      next,
      options,
      stop
    );

  return row;
};

const playerOptionsRow = (
  isLooping: boolean
): ActionRowBuilder<MessageActionRowComponentBuilder> => {
  const loop = new ButtonBuilder()
    .setCustomId("loop")
    .setLabel("Loop")
    .setStyle(isLooping ? ButtonStyle.Success : ButtonStyle.Secondary);
  const shuffle = new ButtonBuilder()
    .setCustomId("shuffle")
    .setLabel("Shuffle")
    .setStyle(ButtonStyle.Secondary);
  const remove = new ButtonBuilder()
    .setCustomId("remove")
    .setLabel("Remove")
    .setStyle(ButtonStyle.Secondary);
  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      loop,
      shuffle,
      remove
    );

  return row;
};

export { confirmationRow, paginationRow, playerRow, playerOptionsRow };
