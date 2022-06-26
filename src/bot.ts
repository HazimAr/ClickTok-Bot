import "dotenv/config";
import { Client, Intents } from "discord.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
  ],
});

client.once("ready", () => {
  console.log(`Bot has started, with 
  ${client.users.cache.size} users, in 
  ${client.channels.cache.size} channels of 
  ${client.guilds.cache.size} guilds.`);
  client.user?.setActivity(`Serving 
  ${client.guilds.cache.size} servers`);
});

client.login(process.env.TOKEN);
