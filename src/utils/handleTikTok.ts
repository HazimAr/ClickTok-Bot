import axios from "axios";
import { MessageOptions } from "child_process";
import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Guild,
  GuildChannel,
  MessagePayload,
  TextChannel,
  User,
} from "discord.js";
import { prisma } from "../bot";
import { getOrCreateUser } from "./db";
import { logConversion } from "./logger";

async function getId(url: string, regex: RegExp) {
  let match = url.match(regex);
  if (!match) return null;
  let id = match[match.length - 1];

  if (isNaN(parseInt(id)) && url.length > 5) {
    id = await axios
      .get(match[0])
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
  id = await getId(encodeURI(url), regex);
  // get real id from tiktok
  if (id) return id;

  regex = /(http:|https:\/\/)?(www\.)?tiktok.com\/t\/(\w{5,15})/;
  id = await getId(encodeURI(url), regex);
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

export enum Type {
  MESSAGE = "message",
  COMMAND = "command",
}

export default async function (
  type: Type,
  tiktok,
  user: User,
  guild: Guild,
  channel: GuildChannel
) {
  if (tiktok.aweme_detail?.image_post_info) {
    if (type == Type.COMMAND)
      return {
        content:
          "We currently do not support TikTok slideshows. They will be supported in the near future.",
        // components: [
        //   new ActionRow().addComponents(
        //     new Button()
        //     .setCustomId("info")
        //     .setLabel("Info")
        //     .setStyle("PRIMARY")
        //     .setEmoji("🖥️"),
        //     new Button()
        //     .setCustomId("delete")
        //     .setLabel("Delete")
        //     .setStyle("DANGER")
        //     .setEmoji("🗑️")
        //   )
        // ]
      };
    return;
  }

  const mongoUser = await getOrCreateUser(user);
  if (!mongoUser.lastConvertedAt) {
    user
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Thank you for using ClickTok!")
            .setDescription(
              "You have converted for the first time 🥳!\nAs a sign of our gratitude, we are hosting a nitro giveaway for the first 1000 users that sign up 🤯.\nTo get your chance at winning nitro for **FREE**, join our support server https://discord.gg/tg2QTMEc9g and follow the directions inside of the giveaway channel 🤗. Hope to see you there!"
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
      })
      .catch(() => {
        console.error(`Failed to send welcome message to ${user.tag}`);
      });
  }
  const lastConvertedAt = new Date(Date.now());
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastConvertedAt,
    },
  });

  await prisma.guild.upsert({
    where: { id: guild.id },
    update: {
      lastConvertedAt,
    },
    create: {
      id: guild.id,
      settings: {},
      lastConvertedAt: null,
    },
  });

  const id = tiktok.aweme_detail.aweme_id;
  const conversion = await prisma.conversion.create({
    data: {
      tiktok: id,
      guild: guild.id,
      user: user.id,
    },
  });
  logConversion(
    conversion,
    type,
    tiktok.aweme_detail.video.origin_cover.url_list[0],
    channel as TextChannel
  ).catch(console.error);

  return {
    content: `https://clicktok.xyz/api/v/${id}`,
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("info")
          .setLabel("Info")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🖥️"),

        new ButtonBuilder()
          .setCustomId(`delete-${user.id}`)
          .setLabel("Delete")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🗑️")
      ),
    ],
  };
}
