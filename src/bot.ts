import "dotenv/config";
import {
  ApplicationCommandDataResolvable,
  ButtonInteraction,
  Client,
  CommandInteraction,
  Guild,
  Intents,
  Message,
} from "discord.js";
import { readdirSync } from "fs";
import axios from "axios";
import getTikTokResponse, { getIdFromText } from "./utils/handleTikTok";
import { PrismaClient } from "@prisma/client";
import { getOrCreateGuild } from "./utils/db";
import validTikTokUrl from "./utils/validTikTokUrl";
import { logError, logGuild } from "./utils/logger";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
  ],
});

export const prisma = new PrismaClient();
prisma
  .$connect()
  .then(() => {
    console.log("Connected to Prisma");
  })
  .catch(console.error);

let commands: {
  data: ApplicationCommandDataResolvable;
  run: (interaction: CommandInteraction) => Promise<void>;
}[] = [];

let buttons: {
  id: string;
  run: (interaction: ButtonInteraction) => Promise<void>;
}[] = [];

client.once("ready", async () => {
  console.log(`${client.user.username} has logged in`);
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
});

client.on("guildCreate", async (guild: Guild) => {
  try {
    await prisma.guild.create({
      data: { id: guild.id, settings: {} },
    });
    await logGuild(guild);
  } catch (e) {
    logError(e, guild).catch(console.error);
  }
});

client.on("guildDelete", async (guild: Guild) => {
  try {
    await logGuild(guild, false);
    await prisma.guild.deleteMany({
      where: {
        id: guild.id,
      },
    });
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
        .then(async (response) => {
          const messageResponse = await getTikTokResponse(
            (response as any).data,
            message.author,
            message.guild
          );
          if (message.deletable) {
            await message.reply(messageResponse);
          } else {
            // message doesn't exist anymore
            messageResponse.content = `${message.author} ${messageResponse.content}`;
            await message.channel.send(messageResponse).catch((e) => {
              // channel doesn't exist anymore (prolly got kicked as message was sent lol)
              logError(e, message);
            });
          }

          if (guild.settings.deleteOrigin) {
            if (message.deletable) await message.delete();
          } else if (guild.settings.suppressEmbed) {
            await message.suppressEmbeds(true).then(console.error);
          }
        });
    }
  } catch (e) {
    logError(e, message).catch(console.error);
  }
}

client.on("messageCreate", handleMessage);
client.on("messageUpdate", handleMessage);

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
        .find((button) => button.id == interaction.customId)
        .run(interaction);
      return;
    }
  } catch (e) {
    logError(e, interaction).catch(console.error);
  }
});

client.login(process.env.TOKEN);
