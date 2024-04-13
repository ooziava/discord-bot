import {
  type InteractionReplyOptions,
  type MessageCreateOptions,
  type InteractionEditReplyOptions,
  type MessagePayload,
} from "discord.js";

export type MyInteractionPayload =
  | string
  | MessagePayload
  | MessageCreateOptions
  | InteractionReplyOptions
  | InteractionEditReplyOptions;

type ExcludeType<T, U> = T extends U ? never : T;

export type MyMessageReplyPayload = ExcludeType<
  MyInteractionPayload,
  InteractionReplyOptions | InteractionEditReplyOptions
>;
export type MySlashCommandReplyPayload = ExcludeType<
  MyInteractionPayload,
  MessageCreateOptions | InteractionEditReplyOptions
>;
export type MySlashCommandEditReplyPayload = ExcludeType<
  MyInteractionPayload,
  MessageCreateOptions | InteractionReplyOptions
>;
