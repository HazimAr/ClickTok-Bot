import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { prisma } from "../bot";

export default {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("General details and ClickTok statistics."),

  run: async function run(interaction: CommandInteraction) {
    const conversions = await prisma.conversion.findMany({});
    const users = await prisma.user.findMany({});
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("ClickTok Info")
          .setDescription(
            "Here are some general details and ClickTok statistics."
          )
          .setColor("#9b77e9")
          .addFields([
            {
              name: "TikToks Converted 🎡",
              value: conversions.length.toLocaleString(),
              inline: true,
            },
            {
              name: "Converted Last 24 Hours ⌚",
              value: conversions
                .filter(
                  (conversion) =>
                    conversion.createdAt.getTime() >=
                    Date.now() - 1000 * 60 * 60 * 24
                )
                .length.toLocaleString(),
              inline: true,
            },
            {
              name: "Converted This Server 🏎️",
              value: conversions
                .filter(
                  (conversion) => conversion.guild == interaction.guild.id
                )
                .length.toLocaleString(),
              inline: true,
            },
            {
              name: "Servers ⚙️",
              value: interaction.client.guilds.cache.size.toLocaleString(),
              inline: true,
            },
            {
              name: "Users 😍",
              value: users.length.toLocaleString(),
              inline: true,
            },
          ]),
      ],
    });
  },
};
