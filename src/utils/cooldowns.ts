import { Collection } from "discord.js";
import type MyClient from "./client.js";

export const checkCooldown = async (client: MyClient, userId: string, command: any) => {
  const cooldowns = client.cooldowns;
  if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name)!;
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;

    if (now < expirationTime) {
      return Math.round(expirationTime / 1_000);
    }
  }
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
};
