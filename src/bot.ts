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
import getTikTokResponse from "./utils/handleTikTok";
import { PrismaClient } from "@prisma/client";
import { getOrCreateGuild, getOrCreateUser } from "./utils/db";

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
  async function getId(url: string, regex: RegExp) {
    let match = url.match(regex);
    if (!match) return null;
    let id = match[match.length - 1];

    if (isNaN(parseInt(id)) && url.length > 5) {
      id = await axios
        .get(url)
        .then(async (response) => {
          return await getIdFromText(response.request.res.responseUrl);
        })
        .catch(() => null);
    }
    return id;
  }

  async function getIdFromText(url: string) {
    let regex =
      /(http:|https:\/\/)?(www\.)?tiktok\.com\/(@.{1,24})\/video\/(\d{15,30})/;
    let id = await getId(url, regex);
    if (id) return id;

    regex = /(http:|https:\/\/)?((?!ww)\w{2})\.tiktok.com\/(\w{5,15})/;
    id = await getId(url, regex);
    // get real id from tiktok
    if (id) return id;

    regex = /(http:|https:\/\/)?(www\.)?tiktok.com\/t\/(\w{5,15})/;
    id = await getId(url, regex);
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

  const guild = await getOrCreateGuild(message.guild);

  if (guild.settings.autoEmbed) {
    const id = await getIdFromText(message.content);
    if (!id) return;

    await message.reply(getTikTokResponse(id)).then(async () => {
      getOrCreateGuild(message.guild);
      getOrCreateUser(message.author);
      await prisma.conversion.create({
        data: {
          tiktok: id,
          guild: message.guild.id,
          user: message.author.id,
        },
      });
    });
    if (guild.settings.deleteOrigin) await message.delete();
    else if (guild.settings.suppressEmbed) await message.suppressEmbeds(true);
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
