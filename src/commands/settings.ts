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
    .setDescription("Configure the bot for your server.")
    .addBooleanOption((option) =>
      option
        .setName("auto_embed")
        .setDescription(
          "Automatically embed TikToks in the message if they are found. (Default: true)"
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("delete_origin")
        .setDescription(
          "Delete the original message if a TikTok is found in it after sending the embed. (Default: false)"
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("suppress_embed")
        .setDescription(
          "Remove the original embed discord gives when a TikTok link is found in a message. (Default: true)"
        )
    ),
    // .addBooleanOption((option) =>
    //   option
    //     .setName("public")
    //     .setDescription(
    //       "Allow your server leaderboard to be seen by anyone who has the link. (Default: true)"
    //     )
    // ),
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
