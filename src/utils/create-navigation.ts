import consola from "consola";
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

import { ELEMENTS_PER_PAGE } from "../constants/index.js";

import { ButtonsEnum, type EmbedListBuilder } from "../types/index.js";

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
    try {
      await response.edit({
        components: [navigation("disabled")],
      });
    } catch (error) {
      consola.error(error);
    }
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
        page = Math.ceil(list.length / ELEMENTS_PER_PAGE);
        break;
    }

    try {
      await i.update({
        embeds: [embed.builder(list, page, ...(embed.extra || []))],
        components: [
          navigation(
            page === 1 ? "first" : page * ELEMENTS_PER_PAGE >= list.length ? "last" : "middle"
          ),
        ],
      });
    } catch (error) {
      consola.error(error);
    }
  });
}
