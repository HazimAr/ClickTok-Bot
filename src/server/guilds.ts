import { Notification } from "@prisma/client";
import axios from "axios";
import { Guild } from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";

import { Router } from "express";

import { client, prisma } from "../bot";
import { getOrCreateGuild } from "../utils/db";
const router = Router();

router.use(async (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(400).json({
      message: "Missing authorization header",
    });

  const response = await axios
    .get(`https://discordapp.com/api/users/@me`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    })
    .catch((e) => e.response);
  if (!response?.data?.id) return res.status(401).send();

  res.locals.user = response.data;
  next();
});

router.get("/", async (req, res) => {
  // get all guilds user from discord

  const user = await client.users.fetch(res.locals.user.id);
  if (!user) return res.status(404).send({ error: "Bot unable to see user" });

  const response = await axios
    .get("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: req.headers.authorization,
      },
    })
    .catch((e) => e.response);

  if (response?.status != 200)
    return res.status(response.status).send(response.data);

  const botGuilds = [];
  const normalGuilds = [];

  await Promise.all(
    response.data.map(async (guild) => {
      if (guild.permissions & 0x8) {
        if (client.guilds.cache.get(guild.id)) return botGuilds.push(guild);
        normalGuilds.push(guild);
      }
    })
  );

  res.json({
    botGuilds: botGuilds.sort((a, b) => a.name.localeCompare(b.name)),
    normalGuilds: normalGuilds.sort((a, b) => a.name.localeCompare(b.name)),
  });
});

router.use("/:id", async (req, res, next) => {
  const discordGuild = await client.guilds
    .fetch(req.params.id)
    .catch(() => null);
  if (!discordGuild)
    return res.status(404).json({ message: "Bot not in specified guild." });
  const member = await discordGuild.members
    .fetch(res.locals.user.id)
    .catch(console.error);
  if (!member)
    return res.status(404).json({
      message: "Bot unable to fetch user.",
    });

  if (!member.permissions.has("ADMINISTRATOR"))
    return res.status(401).json({
      message: "Unauthorized",
    });

  res.locals.member = member;
  res.locals.discordGuild = discordGuild;

  next();
});
router.get("/:id", async (req, res) => {
  const mongoGuild = await getOrCreateGuild(res.locals.discordGuild);

  res.json(mongoGuild);
});

router.get("/:id/settings", async (req, res) => {
  const guild = await prisma.guild
    .findFirst({
      where: { id: req.params["id"] },
    })
    .catch(console.error);
  if (!guild)
    return res.status(404).json({
      message: "Guild not found in database.",
    });

  res.send(guild.settings);
});
router.post("/:id/settings", async (req, res) => {
  if (!req.body) return res.status(400).send();
  const guild = await prisma.guild
    .update({
      where: { id: req.params["id"] },
      data: { settings: req.body },
    })
    .catch(console.error);
  if (!guild)
    return res.status(404).json({
      message: "Guild not found in database.",
    });
  res.status(204).send();
});

router.get("/:id/channels", async (req, res) => {
  const discordGuild = res.locals.discordGuild as Guild;

  const channels = (await discordGuild.channels.fetch()).filter(
    (channel) => channel.type === "GUILD_TEXT"
  );

  res.json(channels);
});

router.get("/:id/roles", async (req, res) => {
  const discordGuild = res.locals.discordGuild as Guild;

  const roles = (await discordGuild.roles.fetch()).filter(
    (role) => !role.managed
  );

  res.json(roles);
});

router.get("/:id/notifications", async (req, res) => {
  const guild = await getOrCreateGuild(res.locals.discordGuild);
  res.json(guild.notifications);
});
router.post("/:id/notifications", async (req, res) => {
  if (!req.body) return res.status(400).send();
  if (
    !(await (res.locals.discordGuild as Guild).channels
      .fetch(req.body.channel)
      .catch(() => null))
  )
    return res.status(400).send({ message: "Unable to fetch channel." });

  const data = {
    guild: req.params.id,
    channel: req.body.channel,
    creator: req.body.creator,
  } as any;

  if (req.body.role) data.role = req.body.role;
  if (req.body.preview) data.preview = req.body.preview;

  let notification: void | Notification;
  if (req.body.id) {
    notification = await prisma.notification
      .upsert({
        where: { id: req.body.id },
        update: { ...data, role: data.role ? data.role : { unset: true } },
        create: data,
      })
      .catch(console.error);
  } else {
    notification = await prisma.notification.findFirst({
      where: {
        guild: req.params.id,
        creator: req.body.creator,
      },
    });
    if (notification) {
      return res
        .status(409)
        .send({ message: "Notification for that creator already exists." });
    }
    notification = await prisma.notification
      .create({
        data,
      })
      .catch(console.error);
  }

  res.status(204).send(notification);
});
router.delete("/:id/notifications/:notificationId", async (req, res) => {
  const notification = await prisma.notification
    .delete({
      where: {
        id: req.params.notificationId,

        // this is a security issue if not added
        // guild: req.params.id,
      },
    })
    .catch((e) => {
      res.status(500).send(e);
    });
  if (!notification) return;
  res.status(204).send(notification);
});

export default router;
