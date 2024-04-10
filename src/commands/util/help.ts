import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the bot")
  .addStringOption((option) =>
    option.setName("command").setDescription("The command to get help with").setRequired(false)
  );

export const execute: Execute = async (interaction) => {
  await interaction.reply(`
/play : (url)
/search : query

/queue[q] add : url | (_autocomplete)
/queue[q] remove[rm] : (_autocomplete)
/queue[q] info
/queue[q] clear

/playlist[pl] play : (_autocomplete)
/playlist[pl] info : (_autocomplete)
/playlist[pl] add : url
/playlist[pl] remove : (_autocomplete)
/playlist[pl] create #maybe
/playlist[pl] modify #maybe

/list queue[q]
/list playlists[pl]

/next : (number)
/prev #specific usage
/pause
/loop
/volume : volume
/prefix : prefix

/kill
/help : (command)
/info
`);
};
