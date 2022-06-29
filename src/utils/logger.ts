import {
  Conversion,
  Guild as MongoGuild,
  User as MongoUser,
} from "@prisma/client";
import {
  Guild,
  Interaction,
  Message,
  MessageEmbed,
  User,
  WebhookClient,
} from "discord.js";
import { client } from "../bot";
import { getOrCreateGuild, getOrCreateUser } from "./db";

const conversionWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991419871097278484/aaj0GnqFDYXG_fp67pDUvQjMDF7B2Si7_nuGe5m-Oyj-ic4DKEvdTiQY5vTXdg3UXHVf",
});

const guildWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991424220871532665/aFn1hFFoyMgohf1d2_mhASDpQLWOztmKV68S5phIjo2-bCMsjSY_RFDbNghNhyAvo08A",
});

const errorWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991489446383980544/tu4__lpejm079WmGIF9g3c3kJei93AjRY9C7CKjsh4iUukQ8l576Twb8dguEfxmf4fuz",
});

export async function logConversion(
  conversion: Conversion,
  mongoUser: MongoUser & { conversions: Conversion[] } = null,
  mongoGuild: MongoGuild & { conversions: Conversion[] } = null
) {
  const author = client.users.cache.get(conversion.user);
  const guild = client.guilds.cache.get(conversion.guild);

  mongoUser = mongoUser || (await getOrCreateUser(author));
  mongoGuild = mongoGuild || (await getOrCreateGuild(guild));

  conversionWebhook.send({
    username: "ClickTok",
    avatarURL: "https://clicktok.xyz/logo.png",
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${author.username}#${author.discriminator}-${author.id}`,
          iconURL: author.avatarURL(),
        })
        .setDescription(`https://clicktok.xyz/v/${conversion.tiktok}`)
        .setThumbnail(guild.iconURL())

        .addField(
          "Conversions (User)",
          mongoUser.conversions.length.toLocaleString(),
          true
        )
        .addField(
          "Conversions (Guild)",
          mongoGuild.conversions.length.toLocaleString(),
          true
        )
        .addField("Votes (User)", mongoUser.votes.toLocaleString(), true)

        .addField(
          "Last Converted (User)",
          `<t:${Math.floor(mongoUser.lastConvertedAt.getTime() / 1000)}:R>`,
          true
        )
        .addField(
          "Last Converted (Guild)",
          `<t:${Math.floor(mongoGuild.lastConvertedAt.getTime() / 1000)}:R>`,
          true
        )
        .addField(
          "Last Voted (User)",
          `<t:${Math.floor(mongoUser.lastVotedAt.getTime() / 1000)}:R>`,
          true
        )
        .addField(
          "Created (User)",
          `<t:${Math.floor(author.createdAt.getTime() / 1000)}>`,
          true
        )
        .addField(
          "Created (Guild)",
          `<t:${Math.floor(guild.createdAt.getTime() / 1000)}>`,
          true
        )
        .addField("Tiktok", conversion.tiktok, true)
        .setFooter({
          text: `${guild.name}-${guild.id}`,
          iconURL: guild.iconURL(),
        })
        .setTimestamp(),
    ],
  });
}

export async function logGuild(guild: Guild, joined = true) {
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

        .addField("Language", guild.preferredLocale, true)
        .addField(
          "Created",
          `<t:${Math.floor(guild.createdAt.getTime() / 1000)}>`,
          true
        )
        .setTimestamp()
        .setColor(joined ? "#00ff00" : "#ff0000"),
    ],
  });
}

export async function logError(
  error: Error,
  data: Interaction | Message | Guild = null
) {
  const errorEmbed = new MessageEmbed()
    .setTitle("Error")
    .setDescription(error.message)
    .setColor("#ff0000")
    .setTimestamp();

  if (!(data instanceof Guild)) {
    const user = data.member.user as User;
    const guild = data.guild;
    errorEmbed.setAuthor({
      name: user.username,
      iconURL: user.avatarURL(),
    });
    errorEmbed.setFooter({
      text: `${guild.name}-${guild.id}`,
    });
    errorEmbed.setThumbnail(guild.iconURL());
    if (data instanceof Message) {
      errorEmbed.addField("Message", data.content, true);
    } else {
      if (data.isCommand()) {
        errorEmbed.addField("Command", data.commandName, true);
        errorEmbed.addField(
          "Options",
          data.options.data
            .map((option) => `${option.name}-${option.value}`)
            .join(", "),
          true
        );
      } else if (data.isButton()) {
        errorEmbed.addField("Button Label", data.component.label, true);
        errorEmbed.addField("Button Id", data.customId, true);
      }
    }
  } else {
    errorEmbed.setAuthor({
      name: data.name,
      iconURL: data.iconURL(),
    });
    errorEmbed.setFooter({
      text: `${data.id}`,
    });
    errorEmbed.setThumbnail(data.iconURL());
  }

  errorWebhook.send({
    username: "ClickTok",
    avatarURL: "https://clicktok.xyz/logo.png",
    embeds: [errorEmbed],
  });
}
