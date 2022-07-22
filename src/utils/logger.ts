import { Conversion } from "@prisma/client";
import { WebhookPayload } from "@top-gg/sdk";
import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildChannel,
  Interaction,
  Message,
  TextChannel,
  User,
  WebhookClient,
} from "discord.js";
import { getDiscordGuild, getDiscordUser } from "./clients";
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

const voteWebhook = new WebhookClient({
  url: "https://discord.com/api/webhooks/992451919559790702/IIKQaZKbN1qnT_HJM8uqtbZmOTKFcVRz-3llFJJpN4rVVGtIENIZ8a15mxu4Lm1nqKxc",
});

const username = "ClickTok" + (process.env.JR ? " Jr." : " Sr.");
const avatarURL = "https://clicktok.xyz/logo.png";

export async function logConversion(
  conversion: Conversion | { user: User; guild: Guild; tiktok: string },
  type: string,
  thumbnail: string,
  channel: TextChannel
) {
  const author =
    conversion.user instanceof User
      ? conversion.user
      : await getDiscordUser(conversion.user);
  const guild =
    conversion.guild instanceof Guild
      ? conversion.guild
      : await getDiscordGuild(conversion.guild);

  const mongoUser = await getOrCreateUser(author);
  const mongoGuild = await getOrCreateGuild(guild);

  // @ts-ignore
  (conversion.id ? conversionWebhook : infoWebhook).send({
    username,
    avatarURL,
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `${author.username}#${author.discriminator}-${author.id}`,
          iconURL: author.avatarURL(),
        })
        .setDescription(`https://clicktok.xyz/v/${conversion.tiktok}`)
        .setThumbnail(thumbnail)
        .addFields({
          name: "Conversions (User)",
          value: mongoUser.conversions.length.toLocaleString(),
          inline: true,
        })
        .addFields({
          name: "Conversions (Guild)",
          value: mongoGuild.conversions.length.toLocaleString(),
          inline: true,
        })
        .addFields({
          name: "Votes (User)",
          value: mongoUser.votes.toLocaleString(),
          inline: true,
        })

        .addFields({
          name: "Last Converted (User)",
          value: `<t:${Math.floor(
            mongoUser.lastConvertedAt?.getTime() / 1000
          )}:R>`,
          inline: true,
        })
        .addFields({
          name: "Last Converted (Guild)",
          value: `<t:${Math.floor(
            mongoGuild.lastConvertedAt?.getTime() / 1000
          )}:R>`,
          inline: true,
        })
        .addFields({
          name: "Last Voted (User)",
          value: `<t:${Math.floor(mongoUser.lastVotedAt?.getTime() / 1000)}:R>`,
          inline: true,
        })
        .addFields({
          name: "Created (User)",
          value: `<t:${Math.floor(author.createdAt?.getTime() / 1000)}>`,
          inline: true,
        })
        .addFields({ name: "Channel", value: channel.name, inline: true })
        .addFields({ name: "Type", value: type, inline: true })
        .setFooter({
          text: `${guild.name}-${guild.id}`,
          iconURL: guild.iconURL(),
        })
        .setTimestamp(),
    ],
  });
}

export async function logGuild(guild: Guild, joined = true) {
  const guildOwner = joined
    ? await guild.fetchOwner().catch((e) => ({
        user: {
          username: "Unknown",
          discriminator: "0000",
          id: guild.ownerId,
          avatarURL: () => "https://cdn.discordapp.com/embed/avatars/0.png",
        },
      }))
    : {
        user: {
          username: "Unknown",
          discriminator: "0000",
          id: guild.ownerId,
          avatarURL: () => "https://cdn.discordapp.com/embed/avatars/0.png",
        },
      };
  const mongoGuild = await getOrCreateGuild(guild);
  guildWebhook
    .send({
      username,
      avatarURL,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${guildOwner.user.username}#${guildOwner.user.discriminator}-${guildOwner.user.id}`,
            iconURL: guildOwner.user.avatarURL(),
          })
          .setTitle(guild.name)

          .setThumbnail(guild.iconURL())
          .addFields({
            name: "Members",
            value: guild.memberCount.toLocaleString(),
            inline: true,
          })
          .addFields({
            name: "Boosts",
            value: guild.premiumSubscriptionCount.toLocaleString(),
            inline: true,
          })
          .addFields({
            name: "Channels",
            value: guild.channels.cache.size.toLocaleString(),
            inline: true,
          })
          .addFields({
            name: "Roles",
            value: guild.roles.cache.size.toLocaleString(),
            inline: true,
          })

          .addFields({
            name: "Language",
            value: guild.preferredLocale,
            inline: true,
          })
          .addFields({
            name: "Created",
            value: `<t:${Math.floor(guild.createdAt?.getTime() / 1000)}>`,
            inline: true,
          })
          .addFields({ name: "Guild ID", value: guild.id, inline: true })
          .addFields({
            name: "Owner",
            value: `${guildOwner.user.username}#${guildOwner.user.discriminator}`,
            inline: true,
          })
          .addFields({
            name: "Conversions",
            value: mongoGuild.conversions.length.toLocaleString(),
            inline: true,
          })
          .setTimestamp()
          .setColor(joined ? "#00ff00" : "#ff0000")
          .setFooter({
            iconURL: guild.iconURL(),
            text: `${guild.name}-${guild.id}`,
          }),
      ],
    })
    .catch(console.error);
}

export async function logErrorWebhook(
  error: Error,
  data: Interaction | Message | Guild | any = null,
  ...args
) {
  const errorEmbed = new EmbedBuilder()
    .setTitle("New error stupid")
    .setDescription(
      `${error.message}\n${error.stack}\n${args
        .map((arg) => arg?.toLocaleString() || arg)
        .join(", ")}`
    )
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
      errorEmbed.addFields({
        name: "Message",
        value: data.content,
        inline: true,
      });
    } else {
      if (data instanceof CommandInteraction) {
        errorEmbed.addFields({
          name: "Command",
          value: data.commandName,
          inline: true,
        });
        errorEmbed.addFields({
          name: "Options",
          value: data.options.data
            .map((option) => `${option.name} = \`${option.value}\``)
            .join(", "),
          inline: true,
        });
      } else if (data.isButton()) {
        errorEmbed.addFields({
          name: "Button Id",
          value: data.customId,
          inline: true,
        });
        errorEmbed.addFields({
          name: "Button Label",
          value: data.component.label,
          inline: true,
        });
      }
    }
    errorEmbed.addFields({
      name: "Channel Name",
      value: channel.name,
      inline: true,
    });
    errorEmbed.addFields({
      name: "Channel Id",
      value: channel.id,
      inline: true,
    });
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
  errorWebhook
    .send({
      username,
      avatarURL,
      embeds: [errorEmbed],
    })
    .catch(console.error);
}

export async function logVote(vote: WebhookPayload) {
  const user = await getDiscordUser(vote.user);
  voteWebhook
    .send({
      username,
      avatarURL,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: user.username + "#" + user.discriminator,
            iconURL: user.avatarURL(),
          })
          .setTitle("New vote")
          .setDescription(`${user.username}#${user.discriminator}-${user.id}`)
          .setThumbnail(user.avatarURL())
          .setColor("#00ff00")
          .setFooter({
            text: user.id,
            iconURL: user.avatarURL(),
          })
          .setTimestamp(),
      ],
    })
    .catch(console.error);
}

export async function logError(...args) {}
