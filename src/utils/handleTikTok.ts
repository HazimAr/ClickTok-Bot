import axios from "axios";
import {
  Guild,
  Message,
  MessageActionRow,
  MessageButton,
  User,
} from "discord.js";
import { getOrCreateGuild, getOrCreateUser } from "./db";
import { PrismaClient } from "@prisma/client";
import { logConversion } from "./logger";

const prisma = new PrismaClient();

async function getId(url: string, regex: RegExp) {
  let match = url.match(regex);
  if (!match) return null;
  let id = match[match.length - 1];

  if (isNaN(parseInt(id)) && url.length > 5) {
    id = await axios
      .get(url)
      .then(async (response) => {
        return await getIdFromText(response.request.res.responseUrl);
      })
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
  return id;
}

export async function getIdFromText(url: string) {
  let regex =
    /(http:|https:\/\/)?(www\.)?tiktok\.com\/(@.{1,24})\/video\/(\d{15,30})/;
  let id = await getId(url, regex);
  if (id) return id;

  regex = /(http:|https:\/\/)?((?!ww)\w{2})\.tiktok.com\/(\w{5,15})/;
  id = await getId(url, regex);
  // get real id from tiktok
  if (id) return id;

  regex = /(http:|https:\/\/)?(www\.)?tiktok.com\/t\/(\w{5,15})/;
  id = await getId(url, regex);
  // get real id from tiktok
  if (id) return id;

  regex = /(http:|https:\/\/)?m\.tiktok\.com\/v\/(\d{15,30})/;
  id = await getId(url, regex);
  if (id) return id;

  regex = /(http:|https:\/\/)?(www)?\.tiktok\.com\/(.*)item_id=(\d{5,30})/;
  id = await getId(url, regex);
  if (id) return id;

  return null;
}

export default async function (tiktok, user: User, guild: Guild) {
  prisma.user
    .upsert({
      where: { id: user.id },
      update: {
        lastConvertedAt: new Date(Date.now()),
      },
      create: {
        id: user.id,
      },
    })
    .catch(console.error);

  prisma.guild
    .upsert({
      where: { id: guild.id },
      update: {
        lastConvertedAt: new Date(Date.now()),
      },
      create: {
        id: guild.id,
        settings: {},
      },
    })
    .catch(console.error);

  const id = tiktok.aweme_detail.aweme_id;
  prisma.conversion
    .create({
      data: {
        tiktok: id,
        guild: guild.id,
        user: user.id,
      },
    })
    .then((conversion) => logConversion(conversion))
    .catch(console.error);

  if (tiktok.aweme_detail?.image_post_info) {
    return {
      content:
        "We currently do not support TikTok slideshows. They will be supported in the near future.",
      // components: [
      //   new MessageActionRow().addComponents(
      //     new MessageButton()
      //     .setCustomId("info")
      //     .setLabel("Info")
      //     .setStyle("PRIMARY")
      //     .setEmoji("🖥️"),
      //     new MessageButton()
      //     .setCustomId("delete")
      //     .setLabel("Delete")
      //     .setStyle("DANGER")
      //     .setEmoji("🗑️")
      //   )
      // ]
    };
  }

  return {
    content: `https://clicktok.xyz/api/v/${id}`,
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("info")
          .setLabel("Info")
          .setStyle("PRIMARY")
          .setEmoji("🖥️"),
        new MessageButton()
          .setLabel("Download")
          .setStyle("LINK")
          .setURL(`https://clicktok.xyz/v/${id}`)
          .setEmoji("💾"),
        new MessageButton()
          .setCustomId("delete")
          .setLabel("Delete")
          .setStyle("DANGER")
          .setEmoji("🗑️")
      ),
    ],
  };
}
