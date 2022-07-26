// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import {
  ActivityType,
  ApplicationCommandDataResolvable,
  BaseGuildTextChannel,
  ButtonInteraction,
  ChannelType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  GatewayIntentBits,
  Guild,
  GuildTextBasedChannel,
  Interaction,
  Message,
  MessageOptions,
  PermissionFlagsBits,
  Role,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import "dotenv/config";
import { readdirSync } from "fs";
import humanFormat from "human-format";
import { AutoPoster } from "topgg-autoposter";
import { getOrCreateGuild, getOrCreateUser } from "./utils/db";
import getTikTokResponse, { getIdFromText, Type } from "./utils/handleTikTok";
import { logErrorWebhook, logGuild } from "./utils/logger";
import validTikTokUrl from "./utils/validTikTokUrl";
import { Api } from "@top-gg/sdk";
const api = new Api(process.env.TOPGG_TOKEN);
// import { fetchAllVideosFromUser, IVideo } from "tiktok-scraper-ts";
import server from "./server";

export const options: SimpleLogger.ISimpleLoggerOptions &
  SimpleLogger.IRollingFileAppenderOptions & {
    readLoggerConfig?: Function;
  } = {
  logDirectory: "logs", // NOTE: folder must exist and be writable...
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY.MM.DD",
  timestampFormat: "HH:mm:ss.SSS",
};
import SimpleLogger, { createRollingFileLogger } from "simple-node-logger";
import { launch } from "puppeteer";
import { ItemModule, Sigi } from "./types";
import { getDiscordGuild } from "./utils/clients";
export const log = createRollingFileLogger(options);

server.listen(process.env.PORT || 80, () => {
  console.log("Server listening on port 80");
});

export const prisma = new PrismaClient();

prisma
  .$connect()
  .then(async () => {
    console.log("Connected to Prisma");
    await prisma.notification.deleteMany({
      where: { guild: "934319752468385863" },
    });
  })
  .catch(console.error);

const bots = [process.env.TOKEN, process.env.TOKEN2];
export const clients = bots.map((token) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
  });

  let commands: {
    data: ApplicationCommandDataResolvable;
    run: (interaction: CommandInteraction) => Promise<void>;
  }[] = [];

  let buttons: {
    id: string;
    run: (interaction: ButtonInteraction) => Promise<void>;
  }[] = [];

  client.once("ready", async () => {
    console.log(
      `${client.user.tag} has logged in with ${client.guilds.cache.size} guilds`
    );
    client.user.setActivity({
      type: ActivityType.Playing,
      name: "clicktok.xyz | /tiktok",
    });

    // client.guilds.cache.forEach(async (guild) => {
    //   const conversions = await prisma.conversion.findMany({
    //     where: {
    //       guild: guild.id,
    //     },
    //   });

    //   if (!conversions.length) {
    //     // @ts-ignore
    //     guild.leave();
    //   }
    // });

    readdirSync("./src/buttons").forEach(async (buttonFile) => {
      const buttonFunction = (await import(`./buttons/${buttonFile}`)).default;
      buttons.push({ id: buttonFile.split(".")[0], run: buttonFunction });
    });
    commands = await Promise.all(
      readdirSync("./src/commands").map(async (commandFile) => {
        const command = (await import(`./commands/${commandFile}`)).default;
        return {
          data: command.data,
          run: command.run,
        };
      })
    );

    client.application.commands.set(commands.map((command) => command.data));

    // const giveawayMessage = await (
    //   client.channels.cache.get("992154733206851614") as GuildTextBasedChannel
    // ).messages.fetch("992304881643831297");

    // giveawayMessage.edit({
    //   embeds: [
    //     new EmbedBuilder()
    //       .setTitle("🥳 **Free Nitro** 🥳")
    //       .setDescription(
    //         "To enter into the giveaway click the button below, you can enter the giveaway every time you vote resulting in a higher chance of receiving the reward. You are able to vote every 12 hours. [Vote Here](https://top.gg/bot/990688037853872159/vote)"
    //       )
    //       .setColor("#00ff00"),
    //   ],
    //   components: [
    //     new ActionRowBuilder().addComponents(
    //       new ButtonBuilder()
    //         .setCustomId("giveaway")
    //         .setLabel("Enter Giveaway")
    //         .setEmoji("🎉")
    //         .setStyle("SUCCESS"),
    //       new ButtonBuilder()
    //         .setURL("https://top.gg/bot/990688037853872159/vote")
    //         .setLabel("Vote Here")
    //         .setStyle("LINK")
    //         .setEmoji("🎁")
    //     ),
    //   ],
    // });
  });

  client.on("guildCreate", async (guild: Guild) => {
    log.info("guildCreate: ", guild);
    try {
      await getOrCreateGuild(guild).catch(() => {});
      await getOrCreateUser(await client.users.fetch(guild.ownerId)).catch(
        () => {}
      );
    } catch (e) {
      log.error("guildCreate: ", e, "\n", guild);
      logErrorWebhook(e, guild).catch(console.error);
    }
    try {
      const channels = await guild.channels.fetch();
      const channel = channels
        .filter(
          (channel) =>
            channel.type === ChannelType.GuildText &&
            channel
              .permissionsFor(client.user)
              .has(PermissionFlagsBits.SendMessages)
        )
        .first() as GuildTextBasedChannel;
      if (!channel) return;
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Thank you for using Clicktok!")
            .setDescription(
              "Clicktok offers many different TikTok related features.\n\n**Features**\n> Embed TikToks `/tiktok`\n> Recieve Notifications for a specific creator `/notifications`\n> Setup statistics for a creator `/statistics`\n\n**Setup**\n> Configure the bot `/settings`\n\n**Legal**\n_Public data is sourced from TikTok, but the presentation is not controlled by them. Use of the name TikTok is for context, not claiming any ownership._\n_ClickTok is an approved app on the TikTok for developers portal. Using official APIs. By using our service you agree to our [Terms of Service](https://clicktok.xyz/terms.pdf) and [Privacy Policy](https://clicktok.xyz/privacypolicy.pdf) as well as TikTok's [Terms of Service](https://tiktok.com/legal/terms-of-service-us)_\n\nhttps://clicktok.xyz"
            )
            .setColor("#9b77e9"),
        ],
      });
    } catch (e) {
      log.error("guildCreateMessage: ", e, "\n", guild);
      logErrorWebhook(e, guild).catch(console.error);
    }
  });
  client.on("guildDelete", async (guild: Guild) => {
    try {
      await logGuild(guild, false);
      await prisma.notification.deleteMany({
        where: { guild: guild.id },
      });
      log.info("guildDelete: ", guild);
    } catch (e) {
      log.error("guildDelete: ", e, "\n", guild);
      logErrorWebhook(e, guild).catch(console.error);
    }
  });

  async function handleMessage(message: Message) {
    if (message.author.bot) return;
    if (
      !(message.channel as BaseGuildTextChannel)
        .permissionsFor(client.user)
        .has(PermissionFlagsBits.SendMessages)
    )
      return;
    if (!validTikTokUrl(message.content)) return;
    try {
      const guild = await getOrCreateGuild(message.guild);

      if (guild.settings.autoEmbed) {
        const id = await getIdFromText(message.content);
        if (!id) return;
        await axios
          .get(`https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${id}`)
          .catch(async (e) => {
            const messageResponse = {
              content: "Invalid TikTok link.",
            };

            if (message.deletable) {
              await message.reply(messageResponse);
            } else {
              // message doesn't exist anymore
              messageResponse.content = `${message.author} ${messageResponse.content}`;
              await message.channel.send(messageResponse).catch((e) => {
                // channel doesn't exist anymore (probably got kicked as message was sent lol)
                logErrorWebhook(e, message).catch(console.error);
              });
            }
          })
          .then(async (response) => {
            const messageResponse = (await getTikTokResponse(
              Type.MESSAGE,
              (response as any).data,
              message.author,
              message.guild,
              message.channel as TextChannel
            )) as any;
            if (!messageResponse) return;
            if (message.deletable) {
              await message.reply(messageResponse);
            } else {
              // message doesn't exist anymore
              messageResponse.content = `${message.author} ${messageResponse.content}`;
              await message.channel.send(messageResponse);
            }

            if (guild.settings.deleteOrigin) {
              if (message.deletable) await message.delete();
            } else if (guild.settings.suppressEmbed) {
              if (message.embeds.length)
                await message.suppressEmbeds(true).catch(() => {
                  log.error("suppressEmbeds: ", message);
                });
            }
          });
      }
      log.info("message: ", message);
    } catch (e) {
      log.error("message: ", e, "\n", message);
      logErrorWebhook(e, message).catch(console.error);
    }
  }

  client.on("messageCreate", handleMessage);
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (
      (await getIdFromText(oldMessage.content)) ==
      (await getIdFromText(newMessage.content))
    )
      return;

    await handleMessage(newMessage as Message);
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      if (interaction instanceof CommandInteraction) {
        await commands
          .find((c) => (c.data as any).name === interaction.commandName)
          .run(interaction);
      }
      if (interaction instanceof ButtonInteraction) {
        await buttons
          .find((button) => interaction.customId.startsWith(button.id))
          .run(interaction);
      }
      log.info("interactionCreate: ", interaction);
    } catch (e) {
      log.error("interactionCreate: ", e, "\n", interaction);
      logErrorWebhook(e, interaction).catch(console.error);
    }
  });

  client.login(token);
  return client;
});

export const client = clients[0];
(async () => {
  const browser = await launch({
    headless: false,
    timeout: 60000,
  });

  setInterval(async () => {
    const notifications = await prisma.notification.findMany({});
    notifications.forEach(async (notification, index) => {
      const page = await browser.newPage();
      try {
        await page.goto(`https://tiktok.com/@${notification.creator}`, {
          referer: "https://tiktok.com",
          timeout: 60000,
        });
        const element = await page.waitForSelector("#SIGI_STATE", {
          timeout: 60000,
        });
        if (!element) return;

        const sigi: Sigi = JSON.parse(
          await element.evaluate((e) => e.textContent)
        );

        let mongoCreator = await prisma.creator.findFirst({
          where: { id: sigi.UserPage.uniqueId },
        });

        const keys = Object.keys(sigi.ItemModule);
        const creatorStats = sigi.UserModule.stats[sigi.UserPage.uniqueId];
        if (!mongoCreator) {
          return await prisma.creator.create({
            data: {
              id: sigi.UserPage.uniqueId,
              videos: keys,
              statistics: {
                followers: creatorStats.followerCount,
                likes: creatorStats.heart,
                videos: creatorStats.videoCount,
              },
            },
          });
        }
        const newItems: ItemModule[] = [];

        keys.map((key) => {
          const item = sigi.ItemModule[key];

          if (!mongoCreator.videos.find((v) => v == item.video.id)) {
            newItems.push(item);
            return;
          }
        });

        if (newItems.length) {
          const guild = await getDiscordGuild(notification.guild);
          const channel = (await guild.channels.fetch(
            notification.channel
          )) as GuildTextBasedChannel;
          if (
            !channel
              .permissionsFor(client.user)
              .has(PermissionFlagsBits.SendMessages)
          )
            return;
          let role: Role = null;
          if (notification.role)
            role = await guild.roles.fetch(notification.role);
          for (const newItem of newItems) {
            const message: MessageOptions = {
              embeds: [
                new EmbedBuilder()
                  .setAuthor({
                    name: newItem.nickname,
                    iconURL: newItem.avatarThumb,
                    url: `https://tiktok.com/@${newItem.author}`,
                  })
                  .setTitle(`${newItem.nickname} just posted a new TikTok`)
                  .setURL(
                    `https://tiktok.com/@${newItem.author}/video/${newItem.video.id}`
                  )
                  .setDescription(newItem.desc || "N/A")
                  // TODO: extra text info
                  .setFooter({ text: newItem.video.id })
                  .setThumbnail(newItem.video.cover)
                  .setTimestamp()
                  .setColor("#9b77e9"),
              ],
            };

            if (notification.preview || role)
              try {
                await channel.send({
                  content: `${role ? `${role} ` : ""}${
                    notification.preview
                      ? `https://clicktok.xyz/api/v/${newItem.video.id}`
                      : ""
                  }`,
                });
              } catch (e) {
                log.error("notificationPreview: ", e, "\n", newItem);
              }
            await channel.send(message);
            log.info("notification: ", notification);
          }
          mongoCreator = await prisma.creator.update({
            where: { id: sigi.UserPage.uniqueId },
            data: {
              videos: keys,
              statistics: {
                followers: creatorStats.followerCount,
                likes: creatorStats.heart,
                videos: creatorStats.videoCount,
              },
            },
          });
        }
      } catch (e) {
        log.error("notification: ", e, "\n", notification);
      }
      await page.close();
    });
  }, 1000 * 60 * 5);
})();

setInterval(async () => {
  const statistics = await prisma.statistic.findMany({});
  statistics.forEach(async (statistic) => {
    try {
      const creator = await prisma.creator.findFirst({
        where: { id: statistic.creator },
      });
      const guild = await getDiscordGuild(statistic.guild);
      if (statistic.followers) {
        const channel = (await guild.channels
          .fetch(statistic.followers)
          .catch(() => null)) as VoiceChannel;

        if (channel) {
          await channel
            .edit({
              name: `${statistic.followersPrefix || "Followers: "}${humanFormat(
                creator.statistics.followers
              )}`,
            })
            .catch(() =>
              console.error(
                `Unable to edit channel ${channel.name}-${statistic.followers}`
              )
            );
        }
      }
      if (statistic.likes) {
        const channel = (await guild.channels
          .fetch(statistic.likes)
          .catch(() => null)) as VoiceChannel;

        if (channel) {
          await channel
            .edit({
              name: `${statistic.likesPrefix || "Likes: "}${humanFormat(
                creator.statistics.likes
              )}`,
            })
            .catch(() =>
              console.error(
                `Unable to edit channel ${channel.name}-${statistic.likes}`
              )
            );
        }
      }
      if (statistic.videos) {
        const channel = (await guild.channels
          .fetch(statistic.videos)
          .catch(() => null)) as VoiceChannel;

        if (channel) {
          await channel
            .edit({
              name: `${statistic.videosPrefix || "Videos: "}${humanFormat(
                creator.statistics.videos
              )}`,
            })
            .catch(() =>
              console.error(
                `Unable to edit channel ${channel.name}-${statistic.videos}`
              )
            );
        }
      }
    } catch (e) {
      log.error("statistic: ", e, "\n", statistic);
    }
  });
}, 1000 * 60 * 10);

setInterval(async () => {
  let serverCount = 0;
  for (const client of clients) {
    serverCount += client.guilds.cache.size;
  }
  try {
    await api.postStats({
      serverCount,
    });
  } catch (e) {
    log.error("topgg: ", e, "\n", { serverCount });
  }
}, 1000 * 60 * 5);

// client.login(process.env.TOKEN);
