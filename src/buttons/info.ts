import axios from "axios";
import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { getOrCreateUser } from "../utils/db";
import { logConversion } from "../utils/logger";

export default async function (interaction: ButtonInteraction) {
  const mongoUser = await getOrCreateUser(interaction.user);

  if (mongoUser.lastVotedAt.getTime() + 1000 * 60 * 60 * 12 < Date.now())
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
            .setURL("https://top.gg/bot/990688037853872159/vote")
            .setStyle("LINK"),
          new MessageButton()
            .setCustomId("info")
            .setLabel("I voted (give me my info)")
            .setStyle("PRIMARY")
            .setEmoji("🖥️")
        ),
      ],
    });
  const { data: tiktok } = await axios.get(
    `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${
      interaction.message.content.split("/")[
        interaction.message.content.split("/").length - 1
      ]
    }`
  );
  const author = tiktok.aweme_detail.author;
  const statistics = tiktok.aweme_detail.statistics;
  let description = tiktok.aweme_detail.desc;
  let tags: String[] = (tiktok.aweme_detail.desc as string).match(/#[\w]+/g);

  await interaction.reply({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: author.nickname,
          iconURL: author.avatar_thumb.url_list[0],
        })
        .setTitle(description)
        .setThumbnail(tiktok.aweme_detail.video.cover.url_list[0])
        .setDescription(
          `https://clicktok.xyz/v/${tiktok.aweme_detail.aweme_id}`
        )
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
            name: "Created 🕒",
            value: `<t:${new Date(
              tiktok.aweme_detail.create_time
            ).getTime()}:R>`,
            inline: true,
          },
          {
            name: "Tags 📖",
            value:
              tags
                ?.map((tag) => `[${tag}](https://tiktok.com/tags/${tag})`)
                ?.join(" ") || "No tags",
            inline: true,
          },
        ]),
    ],
    ephemeral: true,
  });

  await logConversion({
    user: interaction.user,
    guild: interaction.guild,
    tiktok:
      interaction.message.content.split("/")[
        interaction.message.content.split("/").length - 1
      ],
  }).catch(console.error);
}
