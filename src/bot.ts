import "dotenv/config";
import {
  ApplicationCommandDataResolvable,
  ButtonInteraction,
  Client,
  Collection,
  CommandInteraction,
  Guild,
  Intents,
  Message,
  TextChannel,
} from "discord.js";
import { AutoPoster } from "topgg-autoposter";
import { readdirSync } from "fs";
import axios from "axios";
import getTikTokResponse, { getIdFromText, Type } from "./utils/handleTikTok";
import { PrismaClient } from "@prisma/client";
import { getOrCreateGuild } from "./utils/db";
import validTikTokUrl from "./utils/validTikTokUrl";
import { logError, logGuild } from "./utils/logger";
// import { fetchAllVideosFromUser, IVideo } from "tiktok-scraper-ts";
import server from "./server";

server.listen(8080, () => {
  console.log("Server listening on port 8080");
});

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
  ],
});

export const prisma = new PrismaClient({
  errorFormat: "pretty",
});

prisma
  .$connect()
  .then(async () => {
    console.log("Connected to Prisma");
  })
  .catch(console.error);

const ap = AutoPoster(process.env.TOPGG_TOKEN, client);
ap.on("posted", (stats) => console.log(stats));

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
    `${client.user.username} has logged in with ${client.guilds.cache.size} guilds`
  );
  client.user.setActivity({
    type: "PLAYING",
    name: "clicktok.xyz | /tiktok",
  });
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
  // const userVideos = new Collection<string, IVideo[]>();

  // const notifications = await prisma.notification.findMany({});
  // notifications.forEach(async (notification) => {
  //   const videos = await fetchAllVideosFromUser("charlidamelio");

  //   console.log(videos);
  // });

  // setInterval(async () => {
  //   checkNewVideos("khaby.lame");
  // }, 1000 * 60 * 5);

  // const giveawayMessage = await (
  //   client.channels.cache.get("992154733206851614") as GuildTextBasedChannel
  // ).messages.fetch("992304881643831297");

  // giveawayMessage.edit({
  //   embeds: [
  //     new MessageEmbed()
  //       .setTitle("🥳 **Free Nitro** 🥳")
  //       .setDescription(
  //         "To enter into the giveaway click the button below, you can enter the giveaway every time you vote resulting in a higher chance of receiving the reward. You are able to vote every 12 hours. [Vote Here](https://top.gg/bot/990688037853872159/vote)"
  //       )
  //       .setColor("#00ff00"),
  //   ],
  //   components: [
  //     new MessageActionRow().addComponents(
  //       new MessageButton()
  //         .setCustomId("giveaway")
  //         .setLabel("Enter Giveaway")
  //         .setEmoji("🎉")
  //         .setStyle("SUCCESS"),
  //       new MessageButton()
  //         .setURL("https://top.gg/bot/990688037853872159/vote")
  //         .setLabel("Vote Here")
  //         .setStyle("LINK")
  //         .setEmoji("🎁")
  //     ),
  //   ],
  // });
});

client.on("guildCreate", async (guild: Guild) => {
  try {
    let mongoGuild = await prisma.guild.findFirst({
      where: { id: guild.id },
      include: {
        conversions: true,
      },
    });

    if (!mongoGuild) {
      mongoGuild = await prisma.guild.create({
        data: { id: guild.id, settings: {}, lastConvertedAt: null },
        include: {
          conversions: true,
        },
      });
    }
    logGuild(guild);
    let mongoUser = await prisma.user.findFirst({
      where: { id: guild.ownerId },
    });

    if (!mongoUser) {
      await prisma.user.create({
        data: {
          id: guild.ownerId,
          lastConvertedAt: null,
          lastVotedAt: null,
        },
      });
    }
  } catch (e) {
    logError(e, guild).catch(console.error);
  }
});

client.on("guildDelete", async (guild: Guild) => {
  try {
    await logGuild(guild, false);
  } catch (e) {
    logError(e, guild).catch(console.error);
  }
});

async function handleMessage(message: Message) {
  if (message.author.bot) return;
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
          await message.reply(messageResponse);
          if (message.deletable) {
            await message.reply(messageResponse);
          } else {
            // message doesn't exist anymore
            messageResponse.content = `${message.author} ${messageResponse.content}`;
            await message.channel.send(messageResponse).catch((e) => {
              // channel doesn't exist anymore (probably got kicked as message was sent lol)
              logError(e, message).catch(console.error);
            });
          }
        })
        .then(async (response) => {
          const messageResponse = await getTikTokResponse(
            Type.MESSAGE,
            (response as any).data,
            message.author,
            message.guild,
            message.channel as TextChannel
          );
          if (!messageResponse) return;
          if (message.deletable) {
            await message.reply(messageResponse);
          } else {
            // message doesn't exist anymore
            messageResponse.content = `${message.author} ${messageResponse.content}`;
            await message.channel.send(messageResponse).catch((e) => {
              // channel doesn't exist anymore (probably got kicked as message was sent lol)
              logError(e, message).catch(console.error);
            });
          }

          if (guild.settings.deleteOrigin) {
            if (message.deletable) await message.delete();
          } else if (guild.settings.suppressEmbed) {
            if (message.embeds.length)
              await message.suppressEmbeds(true).catch((e) => {
                // STUPID ASS MF NO MANAGE MESSAGE PERMS FUCK YOU SERVER OWNERS
              });
          }
        });
    }
  } catch (e) {
    logError(e, message).catch(console.error);
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

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      await commands
        .find((c) => c.data.name === interaction.commandName)
        .run(interaction);
      return;
    }
    if (interaction.isButton()) {
      await buttons
        .find((button) => interaction.customId.startsWith(button.id))
        .run(interaction);
      return;
    }
  } catch (e) {
    logError(e, interaction).catch(console.error);
  }
});

client.login(process.env.JR ? process.env.TOKEN_JR : process.env.TOKEN);
