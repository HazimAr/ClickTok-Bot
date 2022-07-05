import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { client } from "../../bot";
const prisma = new PrismaClient();
const router = Router();
router.get("/", async (_, res) => {
  // get all guilds from db
  const mongoGuilds = await prisma.guild.findMany({
    include: {
      conversions: true,
    },
  });

  let guildsLeaderboards = [];

  for (const mongoGuild of mongoGuilds) {
    if (mongoGuild.conversions.length == 0) continue;
    const discordGuild = client.guilds.cache.get(mongoGuild.id);
    if (!discordGuild) continue;
    guildsLeaderboards.push({
      name: discordGuild.name,
      icon: discordGuild.iconURL(),
      conversions: mongoGuild.conversions.length,
      createdAt: mongoGuild.createdAt,
    });
  }

  // sort guilds by conversion count
  guildsLeaderboards = guildsLeaderboards.sort(
    (a, b) => b.conversions - a.conversions
  );

  // send guilds to client
  res.json(guildsLeaderboards);
});
export default router;
