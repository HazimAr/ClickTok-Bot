import { Collection } from "discord.js";
import { Router } from "express";
import { client, prisma } from "../bot";
const router = Router();

router.get("/", async (_, res) => {
  // get all guilds from db
  const mongoGuilds = await prisma.guild
    .findMany({
      include: {
        conversions: true,
      },
    })
    .catch((e) => {});
  if (!mongoGuilds) return res.status(500).send("Error");

  let guildsLeaderboards = [];

  for (const mongoGuild of mongoGuilds) {
    if (mongoGuild.conversions.length == 0) continue;
    const discordGuild = client.guilds.cache.get(mongoGuild.id);
    if (!discordGuild) continue;
    guildsLeaderboards.push({
      id: discordGuild.id,
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

router.get("/:id", async (req, res) => {
  // get guild from db
  const mongoGuild = await prisma.guild.findFirst({
    where: {
      id: req.params.id,
    },
    include: {
      conversions: true,
    },
  });

  if (!mongoGuild?.settings?.public)
    return res.status(404).send();

  if (!mongoGuild.conversions.length) {
    return res.status(204).send();
  }

  type LeaderboardUser = {
    username: string;
    avatarURL: string;
    conversions: number;
    createdAt: Date;
  };
  const userGuildLeaderboardsMap = new Collection<string, LeaderboardUser>();

  for (const conversion of mongoGuild.conversions) {
    const userObject = userGuildLeaderboardsMap.get(conversion.user);
    if (!userObject) {
      const discordUser = await client.users.fetch(conversion.user);
      if (!discordUser) continue;
      userGuildLeaderboardsMap.set(conversion.user, {
        username: discordUser.username,
        avatarURL: discordUser.avatarURL(),
        conversions: 1,
        createdAt: conversion.createdAt,
      });
      continue;
    }
    userObject.conversions++;
  }

  const userGuildLeaderboards = userGuildLeaderboardsMap.sort(
    (a, b) => b.conversions - a.conversions
  );

  res.json(userGuildLeaderboards);
});

export default router;