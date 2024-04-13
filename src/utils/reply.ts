import { Message } from "discord.js";
import type { MyCommandInteraction } from "../types/command.js";
import type {
  MyInteractionPayload,
  MyMessageReplyPayload,
  MySlashCommandReplyPayload,
  MySlashCommandEditReplyPayload,
} from "../types/reply.js";

function reply(interaction: MyCommandInteraction, payload: MyInteractionPayload, reply?: boolean) {
  if (interaction instanceof Message) {
    const messagePayload = payload as MyMessageReplyPayload;
    return reply ? interaction.reply(messagePayload) : interaction.channel.send(messagePayload);
  } else {
    if (interaction.replied || (reply && interaction.deferred))
      return interaction.followUp(payload as MySlashCommandReplyPayload);
    if (interaction.deferred)
      return interaction.editReply(payload as MySlashCommandEditReplyPayload);
    return interaction.reply(payload as MySlashCommandReplyPayload);
  }
}

export default reply;
