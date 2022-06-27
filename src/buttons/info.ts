import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { getOrCreateUser } from "../utils/db";

export default async function (interaction: ButtonInteraction) {
  // check if user has voted in the last 24 hours
  const mongoUser = await getOrCreateUser(interaction.user);

  // check if voted in the last 24 hours
  if (!(mongoUser.lastVotedAt.getTime() > Date.now() - 86400000))
    return await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "It looks like you haven't voted in the last 24 hours. To help keep this bot free votes are needed. Once you have voted you can view your info."
          ),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setLabel("Vote")
            .setURL(`https://top.gg/bot/${interaction.client.user.id}/vote`)
            .setStyle("LINK"),
          new MessageButton()
            .setCustomId("info")
            .setLabel("Info")
            .setStyle("PRIMARY")
            .setEmoji("🖥️")
        ),
      ],
    });
  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: "Author Name",
          iconURL: "https://hazim.tech/logo.png",
        })
        .setTitle("Video Title")
        .setThumbnail("https://hazim.tech/logo.png")
        .setDescription("[TikTok](link)")
        .addFields([
          {
            name: "Views",
            value: "312,312",
            inline: true,
          },
        ]),
    ],
  });
}
