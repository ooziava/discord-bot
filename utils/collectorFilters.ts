import { CommandInteraction, Interaction } from "discord.js";

type Filter = (i: Interaction) => boolean;

const userFilter = (interaction: CommandInteraction): Filter => {
  return (i: Interaction): boolean => i.user.id === interaction.user.id;
};

export { userFilter };
