import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { ButtonsEnum } from "../../types/models.js";

export default function navigation(position: "first" | "last" | "middle" | "disabled" = "first") {
  const back = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.Back)
    .setLabel("<");

  const veryBack = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.VeryBack)
    .setLabel("<<");

  const forward = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.Forward)
    .setLabel(">");

  const veryForward = new ButtonBuilder()
    .setStyle(ButtonStyle.Primary)
    .setCustomId(ButtonsEnum.VeryForward)
    .setLabel(">>");

  back.setDisabled(position === "first" || position === "disabled");
  veryBack.setDisabled(position === "first" || position === "disabled");
  forward.setDisabled(position === "last" || position === "disabled");
  veryForward.setDisabled(position === "last" || position === "disabled");
  return new ActionRowBuilder<ButtonBuilder>().addComponents(veryBack, back, forward, veryForward);
}
