import { Guild, User } from "discord.js";
import { prisma } from "../bot";
import { logErrorWebhook, logGuild } from "./logger";

export async function getOrCreateGuild(guild: Guild) {
  let mongoGuild = await prisma.guild
    .findFirst({
      where: { id: guild.id },
      include: {
        conversions: true,
        notifications: true,
        statistics: true,
      },
    })
    .catch((e) => logErrorWebhook(e, guild).catch(console.error));

  if (!mongoGuild) {
    mongoGuild = await prisma.guild.create({
      data: {
        id: guild.id,
        settings: {
          lists: {
            channels: {
              values: [],
              whitelist: false,
            },
            users: {
              values: [],
              whitelist: false,
            },
            roles: {
              values: [],
              whitelist: false,
            },
          },
        },
        lastConvertedAt: null,
      },
      include: {
        conversions: true,
        notifications: true,
        statistics: true,
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
