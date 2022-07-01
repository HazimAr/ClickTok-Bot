import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { prisma } from "../bot";
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
        new MessageEmbed()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "Woah there, it looks like you have already entered in the last 12 hours. Come back in 12 hours to enter again."
          )
          .setColor("#ff0000"),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Vote")
            .setURL("https://top.gg/bot/990688037853872159/vote")
            .setStyle("LINK")
        ),
      ],
      ephemeral: true,
    });
  }

  if (mongoUser.lastVotedAt?.getTime() < Date.now() - 1000 * 60 * 60 * 12) {
    return await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "It looks like you haven't voted in the last 12 hours 😭. Once you have voted click on the `Enter Giveaway` button again to recieve your entry. If this issue persists, please contact a developer."
          )
          .setColor("#ff0000"),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Vote")
            .setURL("https://top.gg/bot/990688037853872159/vote")
            .setStyle("LINK")
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
      new MessageEmbed()
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.avatarURL(),
        })
        .setTitle(`You have entered the giveaway!`)
        .setDescription(
          "If you have won the giveaway, you will be notified and have 24 hours to claim your prize. If you do not claim your prize in time, we will reroll the giveaway."
        )
        .setThumbnail(interaction.client.user.avatarURL())
        .addField(
          "Entries",
          mongoUser.giveawayEntries.length.toLocaleString(),
          true
        )
        .setColor("#00ff00")
        .setFooter({
          text: "ClickTok",
          iconURL: "https://clicktok.xyz/logo.png",
        })
        .setTimestamp(),
    ],
    ephemeral: true,
  });
}
