import { PrismaClient } from "@prisma/client";
import axios from "axios";

import { Router } from "express";

import { client } from "../bot";
const router = Router();

router.use(async (req, res, next) => {
  if (!req.headers.authorization) return res.status(403).send();

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

router.get("/guilds", async (req, res) => {
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

export default router;
