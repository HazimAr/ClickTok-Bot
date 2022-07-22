import { FetchGuildOptions, UserResolvable } from "discord.js";
import { clients } from "../bot";

export async function getDiscordGuild(guild: string | FetchGuildOptions) {
  for (const client of clients) {
    const discordGuild = await client.guilds.fetch(guild).catch((e) => null);
    if (discordGuild) return discordGuild;
  }
  throw new Error("Unable to find guild");
}

export async function getDiscordUser(user: UserResolvable) {
  for (const client of clients) {
    const discordUser = await client.users.fetch(user).catch((e) => null);
    if (discordUser) return discordUser;
  }
  throw new Error("Unable to find user");
}
