import type { AutocompleteInteraction, ChatInputCommandInteraction, Message } from "discord.js";

export type MyCommandInteraction = ChatInputCommandInteraction<"cached" | "raw"> | Message<true>;
export type Execute = (interaction: MyCommandInteraction, args?: string[]) => Promise<any>;

export type Data = {
  name: string;
  description: string;
  options?: any;
};

export type Cooldown = number;
export type Aliases = string[] | string;
export type Autocomplete = (interaction: AutocompleteInteraction<"cached" | "raw">) => Promise<any>;

export type Command = {
  data: Data;
  execute: Execute;
  autocomplete?: Autocomplete;
  aliases?: Aliases;
  cooldown?: Cooldown;
};
