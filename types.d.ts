type Execute = (
  interaction: import("discord.js").CommandInteraction,
  client: import("./index.js").MyClient
) => Promise<void>;
type CommandData = import("discord.js").SlashCommandBuilder<any>;

interface Command {
  data: CommandData;
  execute: Execute;
}
