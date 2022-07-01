import { Conversion, Prisma } from "@prisma/client";
import {
  Guild,
  GuildChannel,
  Interaction,
  Message,
  MessageEmbed,
  User,
  WebhookClient,
} from "discord.js";
import { client, jr } from "../bot";
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

const infoWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/991534525811265596/9YLJx5sAnE0-wplz2TF3kWXjBpzC6OD5y_W_for_E0FuiRpYNgKGjaV2pG40mVDvHMjo",
});

const username = "ClickTok" + (jr ? " Jr." : " Sr.");
const avatarURL = "https://clicktok.xyz/logo.png";

export async function logConversion(
  conversion: Conversion | { user: User; guild: Guild; tiktok: string }
) {
  const author =
    conversion.user instanceof User
      ? conversion.user
      : client.users.cache.get(conversion.user);
  const guild =
    conversion.guild instanceof Guild
      ? conversion.guild
      : client.guilds.cache.get(conversion.guild);

  const mongoUser = await getOrCreateUser(author);
  const mongoGuild = await getOrCreateGuild(guild);

  // @ts-ignore
  (conversion.id ? conversionWebhook : infoWebhook).send({
    username,
    avatarURL,
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
    username,
    avatarURL,
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
    .setTitle("New error stupid")
    .setDescription(`${error.message}\n${error.stack}`)
    .setColor("#ff0000")
    .setTimestamp();

  if (!(data instanceof Guild)) {
    const user = data.member.user as User;
    const channel = data.channel as GuildChannel;
    const guild = data.guild;
    errorEmbed.setAuthor({
      name: `${user.username}#${user.discriminator}-${user.id}`,
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
            .map((option) => `${option.name} = \`${option.value}\``)
            .join(", "),
          true
        );
      } else if (data.isButton()) {
        errorEmbed.addField("Button Id", data.customId, true);
        errorEmbed.addField("Button Label", data.component.label, true);
      }
    }
    errorEmbed.addField("Channel Name", channel.name, true);
    errorEmbed.addField("Channel Id", channel.id, true);
  } else {
    errorEmbed.setAuthor({
      name: data.name,
      iconURL: data.iconURL(),
    });
    errorEmbed.setFooter({
      text: data.id,
    });
    errorEmbed.setThumbnail(data.iconURL());
  }
  errorWebhook.send({
    username,
    avatarURL,
    embeds: [errorEmbed],
  });
}
