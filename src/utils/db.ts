import { prisma } from "../bot";
import { Guild, User } from "discord.js";
import { logGuild } from "./logger";

export async function getOrCreateGuild(guild: Guild) {
  let mongoGuild = await prisma.guild.findFirst({
    where: { id: guild.id },
    include: {
      conversions: true,
    },
  });

  if (!mongoGuild) {
    mongoGuild = await prisma.guild.create({
      data: { id: guild.id, settings: {} },
      include: {
        conversions: true,
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
      data: { id: user.id },
      include: {
        conversions: true,
        giveawayEntries: true,
      },
    });
  }

  return mongoUser;
}
