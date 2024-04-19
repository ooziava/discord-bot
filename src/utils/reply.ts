import { Message } from "discord.js";

import type {
  MyCommandInteraction,
  MyInteractionPayload,
  MyMessageReplyPayload,
  MySlashCommandReplyPayload,
  MySlashCommandEditReplyPayload,
} from "../types/index.js";

export function reply(
  interaction: MyCommandInteraction,
  payload: MyInteractionPayload,
  reply?: boolean
) {
  if (interaction instanceof Message) {
    const messagePayload = payload as MyMessageReplyPayload;
    return reply ? interaction.reply(messagePayload) : interaction.channel.send(messagePayload);
  } else {
    if (interaction.deferred) {
      return interaction.editReply(payload as MySlashCommandEditReplyPayload);
    }
    if (interaction.replied) {
      if (reply) return interaction.followUp(payload as MySlashCommandReplyPayload);
      return interaction.editReply(payload as MySlashCommandEditReplyPayload);
    }
    return interaction.reply(payload as MySlashCommandReplyPayload);
  }
}
