import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  GuildMemberRoleManager,
} from "discord.js";
import { log, prisma } from "../bot";
import { getOrCreateUser } from "../utils/db";

export default async function (interaction: ButtonInteraction) {
  const mongoUser = await getOrCreateUser(interaction.user);

  const userEntries = mongoUser.giveawayEntries.sort(
    (a, b) => a.createdAt?.getTime() - b.createdAt?.getTime()
  );

  if (
    userEntries.length &&
    userEntries[userEntries.length - 1].createdAt?.getTime() +
      1000 * 60 * 60 * 12 >
      Date.now()
  ) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "Woah there, it looks like you have already entered in the last 12 hours. Come back in 12 hours to enter again."
          )
          .setColor("#ff0000"),
      ],
      components: [
        //@ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Vote")
            .setURL("https://top.gg/bot/990688037853872159/vote")
            .setStyle(ButtonStyle.Link)
        ),
      ],
      ephemeral: true,
    });
  }

  if (
    (mongoUser.lastVotedAt?.getTime() || 0) <
    Date.now() - 1000 * 60 * 60 * 12
  ) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "It looks like you haven't voted in the last 12 hours 😭. Once you have voted click on the `Enter Giveaway` button again to recieve your entry. If this issue persists, please contact a developer."
          )
          .setColor("#ff0000"),
      ],
      components: [
        //@ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Vote")
            .setURL("https://top.gg/bot/990688037853872159/vote")
            .setStyle(ButtonStyle.Link)
        ),
      ],
      ephemeral: true,
    });
  }

  mongoUser.giveawayEntries.push(
    await prisma.giveawayEntries.create({
      data: {
        user: interaction.user.id,
      },
    })
  );

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        })
        .setTitle(`You have entered the giveaway!`)
        .setDescription(
          "If you have won the giveaway, you will be notified and have 24 hours to claim your prize. If you do not claim your prize in time, we will reroll the giveaway."
        )
        .setThumbnail(interaction.client.user.avatarURL())
        .addFields({
          name: "Entries",
          value: mongoUser.giveawayEntries.length.toLocaleString(),
          inline: true,
        })
        .setColor("#00ff00")
        .setFooter({
          text: "ClickTok",
          iconURL: "https://clicktok.xyz/logo.png",
        })
        .setTimestamp(),
    ],
    ephemeral: true,
  });

  (interaction.member.roles as GuildMemberRoleManager)
    .add("995768453170462800")
    .catch((e) => log.error("giveawayRole: ", e, "\n", interaction));
}
