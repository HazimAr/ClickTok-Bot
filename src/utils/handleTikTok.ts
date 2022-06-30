import { PrismaPromise } from "@prisma/client";
import axios from "axios";
import {
  Guild,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User,
} from "discord.js";
import { prisma } from "../bot";
import { logConversion, logError } from "./logger";

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
    .then((mongoUser) => {
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
        .catch(async (e) => await logError(e, guild).catch(console.error));
      if (
        mongoUser.lastConvertedAt.getTime() == mongoUser.createdAt.getTime()
      ) {
        user.send({
          embeds: [
            new MessageEmbed()
              .setTitle("Thank you for using ClickTok!")
              .setDescription(
                "You have converted for the first time 🥳!\nAs a sign of our gratitude, we are hosting a nitro giveaway for the first 1000 users that sign up 🤯.\nTo get your chance at winning nitro for **FREE**, join our support server https://discord.gg/tg2QTMEc9g and react to the message inside of the giveaway channel 🤗. Hope to see you there!"
              )
              .setAuthor({
                name: "ClickTok",
                iconURL: "https://clicktok.xyz/logo.png",
              })
              .setThumbnail("https://clicktok.xyz/logo.png")
              .setColor("#00ff00")
              .setFooter({
                text: "ClickTok",
                iconURL: "https://clicktok.xyz/logo.png",
              })
              .setTimestamp(),
          ],
        });
      }
    })

    .catch(async (e) => await logError(e, guild).catch(console.error));
  const id = tiktok.aweme_detail.aweme_id;
  const conversion = await prisma.conversion
    .create({
      data: {
        tiktok: id,
        guild: guild.id,
        user: user.id,
      },
    })
    .then(async (conversion) => {
      logConversion(conversion).catch(console.error);
      return conversion;
    });

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
