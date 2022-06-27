import "dotenv/config";
import {
  ApplicationCommandDataResolvable,
  ButtonInteraction,
  Client,
  CommandInteraction,
  Intents,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { readdirSync } from "fs";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    return commands
      .find((c) => c.data.name === interaction.commandName)
      .run(interaction);
  }
  if (interaction.isButton()) {
    return buttons
      .find((button) => button.id == interaction.customId)
      .run(interaction);
  }
});

client.login(process.env.TOKEN);
