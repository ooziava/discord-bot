import type { APIEmbed, JSONEncodable } from "discord.js";

export type EmbedListBuilder<T> = (
  list: T[],
  page: number,
  ...args: any[]
) => APIEmbed | JSONEncodable<APIEmbed>;
