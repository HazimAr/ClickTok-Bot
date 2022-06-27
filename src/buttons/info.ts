import axios from "axios";
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
            .setLabel("I voted (give me my info)")
            .setStyle("PRIMARY")
            .setEmoji("🖥️")
        ),
      ],
    });
  const { data: video } = await axios.get(
    `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${
      interaction.message.content.split("/")[
        interaction.message.content.split("/").length - 1
      ]
    }`
  );
  const author = video.aweme_detail.author;
  const statistics = video.aweme_detail.statistics;
  let description = video.aweme_detail.desc;
  let tags: String[] = (video.aweme_detail.desc as string).match(/#[\w]+/g);

  interaction.reply({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: author.nickname,
          iconURL: author.avatar_thumb.url_list[0],
        })
        .setTitle(description)
        .setThumbnail("https://hazim.tech/logo.png")
        .setDescription(`https://clicktok.xyz/v/${video.aweme_detail.aweme_id}`)
        .addFields([
          {
            name: "Views 👀",
            value: statistics.play_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Likes ❤️",
            value: statistics.digg_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Comments 💬",
            value: statistics.comment_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Shares 🔗",
            value: statistics.share_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Downloads 💾",
            value: statistics.download_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Created At 🕒",
            value: `<t:${new Date(
              video.aweme_detail.create_time
            ).getTime()}:R>`,
            inline: true,
          },
          {
            name: "Tags 📖",
            value: tags
              .map((tag) => `[${tag}](https://tiktok.com/tags/${tag})`)
              .join(" "),
            inline: true,
          },
        ]),
    ],
    ephemeral: true,
  });
}
