import "dotenv/config";
import {
  ApplicationCommandDataResolvable,
  ButtonInteraction,
  Client,
  CommandInteraction,
  Guild,
  Intents,
} from "discord.js";
import { readdirSync } from "fs";
import axios from "axios";
import getTikTokResponse, { getIdFromText } from "./utils/handleTikTok";
import { PrismaClient } from "@prisma/client";
import { getOrCreateGuild, getOrCreateUser } from "./utils/db";
import validTikTokUrl from "./utils/validTikTokUrl";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
  ],
});

const prisma = new PrismaClient();
prisma.$connect().then(() => console.log("Connected to Prisma"));

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
  await prisma.guild.create({
    data: {
      id: guild.id,
      settings: {},
    },
  });
});

client.on("guildDelete", async (guild: Guild) => {
  await prisma.guild.deleteMany({
    where: {
      id: guild.id,
    },
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!validTikTokUrl(message.content)) return;
  const guild = await getOrCreateGuild(message.guild);

  if (guild.settings.autoEmbed) {
    const id = await getIdFromText(message.content);
    if (!id) return;
    await axios
      .get(`https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${id}`)
      .catch(console.error)
      .then(async (response) => {
        await message.reply(
          await getTikTokResponse(
            (response as any).data,
            message.author,
            message.guild
          )
        );
        if (guild.settings.deleteOrigin) await message.delete();
        else if (guild.settings.suppressEmbed)
          await message.suppressEmbeds(true);
      })
      .then(async () => {
        await prisma.conversion.create({
          data: {
            tiktok: id,
            guild: message.guild.id,
            user: message.author.id,
          },
        });
      });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    return await commands
      .find((c) => c.data.name === interaction.commandName)
      .run(interaction);
  }
  if (interaction.isButton()) {
    return await buttons
      .find((button) => button.id == interaction.customId)
      .run(interaction);
  }
});

client.login(process.env.TOKEN);
