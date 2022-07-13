import { prisma } from "../bot";
import { Guild, User } from "discord.js";
import { logGuild } from "./logger";

export async function getOrCreateGuild(guild: Guild) {
  let mongoGuild = await prisma.guild.findFirst({
    where: { id: guild.id },
    include: {
      conversions: true,
      notifications: true,
    },
  });

  if (!mongoGuild) {
    mongoGuild = await prisma.guild.create({
      data: { id: guild.id, settings: {}, lastConvertedAt: null },
      include: {
        conversions: true,
        notifications: true,
      },
    });
    logGuild(guild);
  }

  return mongoGuild;
}

export async function getOrCreateUser(user: User) {
  let mongoUser = await prisma.user.findFirst({
    where: { id: user.id },
    include: {
      conversions: true,
      giveawayEntries: true,
    },
  });

  if (!mongoUser) {
    mongoUser = await prisma.user.create({
      data: { id: user.id, lastConvertedAt: null, lastVotedAt: null },
      include: {
        conversions: true,
        giveawayEntries: true,
      },
    });
  }

  return mongoUser;
}
