import { PrismaClient } from "@prisma/client";
import { Collection } from "discord.js";
import { Router } from "express";
import { readdirSync } from "fs";
import { client } from "../bot";
const router = Router();
const prisma = new PrismaClient();

router.get("/guilds/:id", async (req, res) => {
  const conversions = await prisma.conversion.findMany({
    where: { guild: req.params.id },
  });

  if (!conversions.length) {
    if (!(await prisma.guild.findFirst({ where: { id: req.params.id } })))
      return res.status(404).send("Guild not found");
    return res.status(204).send();
  }

  type LeaderboardUser = {
    username: string;
    avatarURL: string;
    conversions: number;
    createdAt: Date;
  };
  const userGuildLeaderboards = new Collection<string, LeaderboardUser>();

  for (const conversion of conversions) {
    const userObject = userGuildLeaderboards.get(conversion.user);
    if (!userObject) {
      const discordUser = client.users.cache.get(conversion.user);
      userGuildLeaderboards.set(conversion.user, {
        username: discordUser.username,
        avatarURL: discordUser.avatarURL(),
        conversions: 1,
        createdAt: conversion.createdAt,
      });
      continue;
    }
    userObject.conversions++;
  }

  res.json(conversions);
});

export default router;
