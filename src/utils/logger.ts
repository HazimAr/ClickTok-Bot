import { Conversion, Guild, User } from "@prisma/client";
import { client } from "../bot";
import { MessageEmbed, WebhookClient } from "discord.js";

const conversionWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991419871097278484/aaj0GnqFDYXG_fp67pDUvQjMDF7B2Si7_nuGe5m-Oyj-ic4DKEvdTiQY5vTXdg3UXHVf",
});

const guildWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991424220871532665/aFn1hFFoyMgohf1d2_mhASDpQLWOztmKV68S5phIjo2-bCMsjSY_RFDbNghNhyAvo08A",
});

const userWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991424435099816036/YjMjAt9RXuyDAKkv1ZcQg7qBjbd_x91E4_hlXIpBeDvCangftL4dPiCyBaLy3APam5ad",
});

export function logConversion(conversion: Conversion) {
  const author = client.users.cache.get(conversion.user);
  const guild = client.guilds.cache.get(conversion.guild);
  conversionWebhook.send({
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
        .setTimestamp(),
    ],
  });
}

export function logGuild(mongoGuild: Guild) {
  const guild = client.guilds.cache.get(mongoGuild.id);
  guildWebhook.send({
    embeds: [
      new MessageEmbed()
        .setTitle(guild.name)
        .setDescription(guild.id)
        .setThumbnail(guild.iconURL())
        .setTimestamp(),
    ],
  });
}

export function logUser(mongoUser: User) {
  const author = client.users.cache.get(mongoUser.id);

  userWebhook.send({
    embeds: [
      new MessageEmbed()
        .setTitle(`${author.username}#${author.discriminator}`)
        .setDescription(author.id)
        .setThumbnail(author.avatarURL())
        .setTimestamp(),
    ],
  });
}
