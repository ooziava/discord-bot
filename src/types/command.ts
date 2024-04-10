import type { AutocompleteInteraction, ChatInputCommandInteraction, Message } from "discord.js";

export type Execute = (
  interaction: ChatInputCommandInteraction | Message,
  args?: string[]
) => Promise<any>;

export type Data = {
  name: string;
  description: string;
  options?: any;
};

export type Cooldown = number;
export type Aliases = string[] | string;
export type Autocomplete = (interaction: AutocompleteInteraction) => Promise<any>;

export type Command = {
  data: Data;
  execute: Execute;
  autocomplete?: Autocomplete;
  aliases?: Aliases;
  cooldown?: Cooldown;
};
