import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
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
  const shuffle = new ButtonBuilder()
    .setCustomId("shuffle")
    .setLabel("Shuffle")
    .setStyle(ButtonStyle.Secondary);
  const options = new ButtonBuilder()
    .setCustomId("options")
    .setLabel("Options")
    .setStyle(ButtonStyle.Secondary);

  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      prev,
      pause,
      next,
      shuffle,
      options
    );

  return row;
};

const playerOptionsRow =
  (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
    const input = new StringSelectMenuBuilder()
      .setCustomId("test")
      .setPlaceholder("Select an option")
      .addOptions(
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
        { label: "Option 3", value: "3" },
        { label: "Option 4", value: "4" },
        { label: "Option 5", value: "5" },
        { label: "Option 6", value: "6" },
        { label: "Option 7", value: "7" },
        { label: "Option 8", value: "8" },
        { label: "Option 9", value: "9" },
        { label: "Option 10", value: "10" }
      )
      .setMinValues(1)
      .setMaxValues(1);

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        input
      );

    return row;
  };

const featureRow = (): ActionRowBuilder<TextInputBuilder> => {
  const select = new TextInputBuilder()
    .setCustomId("select")
    .setPlaceholder("Select a feature")
    .setMinLength(1)
    .setMaxLength(4);

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(select);

  return row;
};

export {
  confirmationRow,
  paginationRow,
  playerRow,
  featureRow,
  playerOptionsRow,
};
