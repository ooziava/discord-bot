import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  type GuildMember,
  SlashCommandBuilder,
  ComponentType,
  ButtonInteraction,
} from "discord.js";

import EmbedTrack from "../embeds/track.js";
import EmbedNoTrack from "../embeds/notrack.js";
import EmbedFullBar from "../embeds/full-bar.js";
import EmbedShortBar from "../embeds/short-bar.js";
import { getNextSong, getPrevSong, getSong } from "../mongo.js";
import consola from "consola";
import { stream } from "play-dl";

export const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Joins the voice channel");

export const execute: Execute = async (interaction, client) => {
  const member = interaction.member! as GuildMember;
  const channel = member.voice.channel;
  if (!channel) {
    await interaction.reply({
      content: "You must be in a voice channel to use this command!",
      ephemeral: true,
    });
    return;
  }
  if (client.subscriptions.has(interaction.guildId!)) {
    await interaction.reply({
      content: "I'm already in a voice channel!",
      ephemeral: true,
    });
    return;
  }

  let bar = EmbedShortBar;
  const onDisconnect = async () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    if (sub) {
      sub.unsubscribe();
      sub.player.stop();
      client.subscriptions.delete(interaction.guildId!);
    }
    await interaction.deleteReply();
  };
  const onPlayerIdle = async () => {
    const sub = client.subscriptions.get(interaction.guildId!);
    consola.info("Player idle");
    if (sub) {
      const id = client.songs.get(interaction.guildId!)?.id;
      const song = await getNextSong(interaction.guildId!, id || 0);
      if (song) {
        const audiostream = await stream(song.url, { quality: 2 });
        const resource = createAudioResource(audiostream.stream, {
          inputType: audiostream.type,
          inlineVolume: true,
        });
        sub.player.play(resource);
        client.songs.set(interaction.guildId!, song);

        bar.bind(null, {
          pause: sub.player.state.status === AudioPlayerStatus.Paused,
        });

        await interaction.editReply({
          embeds: [EmbedTrack(song)],
          components: [bar()],
        });
        return;
      } else {
        sub.unsubscribe();
        sub.player.stop();
        client.subscriptions.delete(interaction.guildId!);
        await interaction.editReply({
          embeds: [EmbedNoTrack()],
        });
        return;
      }
    }
  };
  const changeSong = async (interaction: ButtonInteraction, getSong: GetSong) => {
    const sub = client.subscriptions.get(interaction.guildId!);
    if (sub) {
      const id = client.songs.get(interaction.guildId!)?.id;
      const song = await getSong(interaction.guildId!, id || 0);
      if (song) {
        try {
          const audiostream = await stream(song.url, { quality: 2 });
          const resource = createAudioResource(audiostream.stream, {
            inputType: audiostream.type,
            inlineVolume: true,
          });
          sub.player.play(resource);
          client.songs.set(interaction.guildId!, song);

          await interaction.update({
            embeds: [EmbedTrack(song)],
          });
        } catch (e) {
          await interaction.reply({
            content: "Error while playing song!",
            ephemeral: true,
          });
        }
      } else {
        sub.unsubscribe();
        sub.player.stop();
        client.subscriptions.delete(interaction.guildId!);
        await interaction.update({
          embeds: [EmbedNoTrack()],
        });
      }
    }
  };

  if (!client.songs.has(interaction.guildId!)) {
    const song = await getSong(interaction.guildId!, 0);
    if (song) client.songs.set(interaction.guildId!, song);
    else {
      await interaction.reply({
        embeds: [EmbedNoTrack()],
      });
      return;
    }
  }
  const song = client.songs.get(interaction.guildId!)!;

  const connection = joinVoiceChannel({
    channelId: member.voice.channelId!,
    guildId: interaction.guildId!,
    adapterCreator: interaction.guild!.voiceAdapterCreator,
  });

  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
  const sub = connection.subscribe(player)!;

  connection.on(VoiceConnectionStatus.Disconnected, onDisconnect);
  player.on(AudioPlayerStatus.Idle, onPlayerIdle);
  client.subscriptions.set(interaction.guildId!, sub);

  try {
    const audiostream = await stream(song.url, { quality: 2 });
    const resource = createAudioResource(audiostream.stream, {
      inputType: audiostream.type,
      inlineVolume: true,
    });
    sub.player.play(resource);
    client.songs.set(interaction.guildId!, song);
  } catch (e) {
    await interaction.reply({
      content: "Error while playing song!",
      ephemeral: true,
    });
    return;
  }

  const response = await interaction.reply({
    embeds: [EmbedTrack(song)],
    components: [EmbedShortBar()],
  });

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000 * 5,
    });

    collector.on("collect", async (button) => {
      collector.resetTimer();
      const pause = player.state.status === AudioPlayerStatus.Paused;
      switch (button.customId) {
        case "prev":
          await changeSong(button, getPrevSong);
          break;
        case "next":
          await changeSong(button, getNextSong);
          break;
        case "pause":
          player.pause();
          await button.update({
            components: [bar({ pause: true })],
          });
          break;
        case "play":
          player.unpause();
          await button.update({
            components: [bar()],
          });
          break;
        case "more":
          bar = EmbedFullBar;
          await button.update({
            components: [bar({ pause })],
          });
          break;
        case "hide":
          bar = EmbedShortBar;
          await button.update({
            components: [bar({ pause })],
          });
          break;
        case "kill":
          connection.disconnect();
          await button.update({
            components: [],
          });
          await interaction.deleteReply();
          break;
        default:
          await button.reply({
            content: "This button is not supported!",
            ephemeral: true,
          });
          break;
      }
    });
  } catch (e) {
    await interaction.editReply({
      embeds: song ? [EmbedTrack(song)] : [],
      components: [EmbedShortBar()],
    });
  }
};
