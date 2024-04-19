import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { ButtonsEnum } from "../../types/models.js";

export default function navigation(position: "first" | "last" | "middle" | "disabled" = "first") {
  const back = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.Back)
    .setLabel("<")
    .setDisabled(position === "first" || position === "disabled");

  const veryBack = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.VeryBack)
    .setLabel("<<")
    .setDisabled(position === "first" || position === "disabled");

  const forward = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.Forward)
    .setLabel(">")
    .setDisabled(position === "last" || position === "disabled");

  const veryForward = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.VeryForward)
    .setLabel(">>")
    .setDisabled(position === "last" || position === "disabled");

  return new ActionRowBuilder<ButtonBuilder>().addComponents(veryBack, back, forward, veryForward);
}
