import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { client } from "../../bot";
const prisma = new PrismaClient();
const router = Router();
router.get("/", async (_, res) => {
  // get all guilds from db
  const mongoUsers = await prisma.guild.findMany({
    include: {
      conversions: true,
    },
  });

  let usersLeaderboards = [];

  for (const mongoUser of mongoUsers) {
    if (mongoUser.conversions.length == 0) continue;
    const discordUser = client.users.cache.get(mongoUser.id);
    if (!discordUser) continue;
    usersLeaderboards.push({
      username: discordUser.username,
      avatarURL: discordUser.avatarURL(),
      conversions: mongoUser.conversions.length,
      createdAt: mongoUser.createdAt,
    });
  }

  // sort guilds by conversion count
  usersLeaderboards = usersLeaderboards.sort(
    (a, b) => b.conversions - a.conversions
  );

  // send guilds to client
  res.json(client.users.cache);
});
export default router;
