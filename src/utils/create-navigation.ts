import {
  Message,
  Collection,
  ComponentType,
  ButtonInteraction,
  InteractionResponse,
  type CacheType,
  type CollectorFilter,
} from "discord.js";

import navigation from "../components/buttons/navigation.js";

import { ButtonsEnum, type EmbedListBuilder } from "../types/index.js";

const itemsPerPage = 15;
export function createNavigation<T>(
  response: Message<boolean> | InteractionResponse<boolean>,
  list: T[],
  embed: {
    builder: EmbedListBuilder<T>;
    extra?: any[];
  },
  filter?: CollectorFilter<
    [ButtonInteraction<CacheType>, Collection<string, ButtonInteraction<CacheType>>]
  >
) {
  let page = 1;
  const collector = response.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    time: 60_000,
  });

  collector.on("end", async () => {
    await response.edit({
      components: [navigation("disabled")],
    });
  });

  collector.on("collect", async (i) => {
    switch (i.customId) {
      case ButtonsEnum.Back:
        page--;
        break;
      case ButtonsEnum.VeryBack:
        page = 1;
        break;
      case ButtonsEnum.Forward:
        page++;
        break;
      case ButtonsEnum.VeryForward:
        page = Math.ceil(list.length / itemsPerPage);
        break;
    }

    await i.update({
      embeds: [embed.builder(list, page, ...(embed.extra || []))],
      components: [
        navigation(page === 1 ? "first" : page * itemsPerPage >= list.length ? "last" : "middle"),
      ],
    });
  });
}
