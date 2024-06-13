import { GuildMember, Message, SlashCommandBuilder } from "discord.js";

import helpEmbed from "../../embeds/help-info.js";

import type { Data, Execute } from "../../types/command.js";
import { connectToChannel } from "../../utils/channel.js";
import { createPlayer } from "../../utils/player.js";
import { createReadStream } from "fs";
import { createAudioResource, StreamType } from "@discordjs/voice";
import consola from "consola";
import { Readable } from "stream";
import { get } from "https";

export const data: Data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the bot")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("The command to get help with")
      .setRequired(false)
      .addChoices(
        { name: "play", value: "play" },
        { name: "search", value: "search" },
        { name: "kill", value: "kill" },
        { name: "queue", value: "queue" },
        { name: "playlist", value: "playlist" },
        { name: "next", value: "next" },
        { name: "pause", value: "pause" },
        { name: "loop", value: "loop" },
        { name: "volume", value: "volume" },
        { name: "prefix", value: "prefix" },
        { name: "info", value: "info" },
        { name: "test url", value: "testurl" },
        { name: "test file", value: "testfile" }
      )
  );

export const execute: Execute = async (client, interaction, arg) => {
  const value =
    interaction instanceof Message
      ? arg?.[0]
      : interaction.options.getString("command") ?? undefined;

  if (value?.includes("test")) {
    try {
      await interaction.channel?.send("Testing player");
      const member = interaction.member;
      if (!(member instanceof GuildMember) || !member.voice.channel) {
        await interaction.channel?.send("You need to be in a voice channel to play a song");
        return;
      }
      const channel = member.voice.channel;
      const connection = await connectToChannel(client, channel);
      const player = createPlayer(interaction.guildId);
      connection.subscribe(player);
      await interaction.channel?.send("Player created");
      const stream = value.includes("url")
        ? createUrlReadStream(
            "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3"
          )
        : createReadStream("src/assets/test.mp3");

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
      });
      player.play(resource);
      await interaction.channel?.send("Playing test audio");
    } catch (error) {
      consola.error(error);
      await interaction.channel?.send(`Error: ${error}`);
    }
  } else
    await interaction.reply({
      embeds: [helpEmbed(value)],
    });
};
export const createUrlReadStream = (url: string): Readable => {
  const readable = new Readable({
    read() {}, // No-op
  });

  get(url, (response) => {
    response.on("data", (chunk: any) => {
      readable.push(chunk);
    });

    response.on("end", () => {
      readable.push(null); // End of stream
    });
  }).on("error", (error) => {
    readable.emit("error", error); // Forward the error to the readable stream
  });

  return readable;
};
