import { SlashCommandBuilder } from "@discordjs/builders";
import { prisma } from "../bot";

import {
  CommandInteraction,
  GuildMember,
  MessageEmbed,
  Permissions,
} from "discord.js";
import { getOrCreateGuild } from "../utils/db";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure the bot for your server."),
  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("We Moved Settings To The Dashboard")
          .setDescription(
            `Please visit the dashboard to configure the bot [here](https://clicktok.xyz/dashboard/${interaction.guild.id}).`
          )
          .setURL("https://clicktok.xyz/dashboard")
          .setColor("#00ff00"),
      ],
      ephemeral: true,
    });
  },
};
