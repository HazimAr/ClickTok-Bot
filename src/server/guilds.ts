import axios from "axios";
import { readdirSync } from "fs";

import { Router } from "express";

import { client, prisma } from "../bot";
const router = Router();

router.use(async (req, res, next) => {
  if (!req.headers.authorization) return res.status(400).send();

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

router.get("/:id/settings", async (req, res) => {
  const guild = await prisma.guild
    .findFirst({
      where: { id: req.params["id"] },
    })
    .catch(console.error);
  if (!guild) return res.status(404).send();
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
  if (!guild) return res.status(404).send();
  res.status(204).send();
});

export default router;
