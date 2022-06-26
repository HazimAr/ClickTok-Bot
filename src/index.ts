import "dotenv/config";
import { ShardingManager } from "discord.js";

const manager = new ShardingManager("./bot.ts", {
  token: process.env.TOKEN,
  totalShards: 1,
});

manager.spawn();
