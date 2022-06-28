import { Conversion, User } from "@prisma/client";
import { client } from "../bot";
import { MessageEmbed, WebhookClient, Guild } from "discord.js";
import { getOrCreateUser } from "./db";

const conversionWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991419871097278484/aaj0GnqFDYXG_fp67pDUvQjMDF7B2Si7_nuGe5m-Oyj-ic4DKEvdTiQY5vTXdg3UXHVf",
});

const guildWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991424220871532665/aFn1hFFoyMgohf1d2_mhASDpQLWOztmKV68S5phIjo2-bCMsjSY_RFDbNghNhyAvo08A",
});

export async function logConversion(
  conversion: Conversion,
  mongoUser: User & { conversions: Conversion[] } = null
) {
  const author = client.users.cache.get(conversion.user);
  const guild = client.guilds.cache.get(conversion.guild);

  mongoUser = mongoUser || (await getOrCreateUser(author));

  conversionWebhook.send({
    username: "ClickTok",
    avatarURL: "https://clicktok.xyz/logo.png",
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${author.username}#${author.discriminator}`,
          iconURL: author.avatarURL(),
        })
        .setDescription(`https://clicktok.xyz/v/${conversion.tiktok}`)
        .setThumbnail(guild.iconURL())
        .addField("Guild", guild.name, true)
        .addField("TikTok", conversion.tiktok, true)
        .addField(
          "Conversions",
          mongoUser.conversions.length.toLocaleString(),
          true
        )
        .addField(
          "Created",
          `<t:${Math.floor(author.createdAt.getTime() / 1000)}>`,
          true
        )
        .addField(
          "Last Converted",
          `<t:${Math.floor(mongoUser.lastConvertedAt.getTime() / 1000)}:R>`,
          true
        )
        .setTimestamp(),
    ],
  });
}

export function logGuild(guild: Guild, joined = true) {
  guildWebhook.send({
    username: "ClickTok",
    avatarURL: "https://clicktok.xyz/logo.png",
    embeds: [
      new MessageEmbed()
        .setTitle(guild.name)
        .setDescription(guild.id)
        .setThumbnail(guild.iconURL())
        .addField("Members", guild.memberCount.toLocaleString(), true)
        .addField(
          "Boosts",
          guild.premiumSubscriptionCount.toLocaleString(),
          true
        )
        .addField("Channels", guild.channels.cache.size.toLocaleString(), true)
        .addField("Roles", guild.roles.cache.size.toLocaleString(), true)
        .addField(
          "Created",
          `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:R>`,
          true
        )
        .setTimestamp()
        .setColor(joined ? "#00ff00" : "#ff0000"),
    ],
  });
}
