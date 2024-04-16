import { SlashCommandBuilder } from "discord.js";
import type { Data, Execute } from "../../types/command.js";

export const data: Data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get help with the bot")
  .addStringOption((option) =>
    option.setName("command").setDescription("The command to get help with").setRequired(false)
  );

export const execute: Execute = async (client, interaction) => {
  await interaction.reply(`
/play : (url)
/search : query

/queue[q] add : url | (_autocomplete)
/queue[q] remove[rm] : name | (_autocomplete)
/queue[q] info
/queue[q] clear

/playlist[pl] add : url
/playlist[pl] play : name | (_autocomplete)
/playlist[pl] info : (name) | (_autocomplete)
/playlist[pl] remove : (name) | (_autocomplete)
/playlist[pl] create #soon
/playlist[pl] modify #soon
/playlist[pl] list

/next : (number)
/pause
/loop #soon
/volume : volume
/prefix : prefix

/kill
/help : (command)
/info
`);
};
