import { PrismaClient } from "@prisma/client";
import { Guild, User } from "discord.js";
import { logGuild, logUser } from "./logger";

const prisma = new PrismaClient();

export async function getOrCreateGuild(guild: Guild) {
  let mongoGuild = await prisma.guild.findFirst({
    where: { id: guild.id },
  });

  if (!mongoGuild) {
    mongoGuild = await prisma.guild.create({
      data: { id: guild.id, settings: {} },
    });
    logGuild(mongoGuild);
  }

  return mongoGuild;
}

export async function getOrCreateUser(user: User) {
  let mongoUser = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (!mongoUser) {
    mongoUser = await prisma.user.create({
      data: { id: user.id },
    });
    logUser(mongoUser);
  }

  return mongoUser;
}
