import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, MessageEmbed } from "discord.js";
import { prisma } from "../bot";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboards")
    .setDescription("View the leaderboards for the server."),

  run: async function run(interaction: CommandInteraction) {
    const usersWithConversions: Collection<string, number> = new Collection();
    (
      await prisma.conversion.findMany({
        where: {
          guild: interaction.guild.id,
        },
      })
    ).forEach((conversion) => {
      const userConversions = usersWithConversions.get(conversion.user);
      if (!userConversions) {
        return usersWithConversions.set(conversion.user, 1);
      }
      usersWithConversions.set(conversion.user, userConversions + 1);
    });

    // Sort the users by their conversions
    const sortedUsers = usersWithConversions.sort((a, b) => {
      return b - a;
    });

    const leaderboards = (
      await Promise.all(
        sortedUsers.first(10).map(async (user, index) => {
          const member = await interaction.guild.members.fetch(user[0]);
          return `${index + 1}. ${member.user.username}#${
            member.user.discriminator
          }: ${user[1]} conversions`;
        })
      )
    ).join("\n");

    // Send the leaderboards
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Leaderboards")
          .setDescription(
            "**Top 10**\n " +
              sortedUsers
                .first(10)
                .map((user, index) => {
                  return `${index + 1}. ${user[0]} - ${user[1]} conversions`;
                })
                .join("\n")
          )
          .setThumbnail(interaction.guild.iconURL())
          .setAuthor({
            name: interaction.guild.name,
            iconURL: interaction.guild.iconURL(),
          })
          .setFooter({
            text: "ClickTok",
            iconURL: "https://clicktok.xyz/logo.png",
          }),
      ],
      ephemeral: true,
    });
  },
};
