import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { getOrCreateUser } from "../utils/db";
import { logConversion } from "../utils/logger";

export default async function (interaction: ButtonInteraction) {
  const mongoUser = await getOrCreateUser(interaction.user);
  const id =
    interaction.message.content.split("/")[
      interaction.message.content.split("/").length - 1
    ] || interaction.message.embeds[0].footer.text;
  if (
    !mongoUser.lastVotedAt ||
    mongoUser.lastVotedAt.getTime() + 1000 * 60 * 60 * 12 < Date.now()
  )
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Hey, ${interaction.user.username}`)
          .setDescription(
            "It looks like you haven't voted in the last 24 hours. To help keep this bot free votes are needed. Once you have voted you can view your info."
          )
          .setFooter({ text: id }),
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

  const { data: tiktok } = await axios.get(
    `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${id}`
  );
  const author = tiktok.aweme_detail?.author;
  const statistics = tiktok.aweme_detail.statistics;
  let description = tiktok.aweme_detail.desc;
  let tags: String[] = (tiktok.aweme_detail.desc as string).match(/#[\w]+/g);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: author?.nickname || "N/A",
          iconURL: author?.avatar_thumb?.url_list?.[0],
        })
        .setTitle(description || "N/A")
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
            )?.getTime()}:R>`,
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
    components: [
      // @ts-ignore
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setURL(`https://clicktok.xyz/v/${tiktok.aweme_detail.aweme_id}`)
          .setLabel("Download (Audio)")
          .setStyle(ButtonStyle.Link)
          .setEmoji("🎵"),
        new ButtonBuilder()
          .setURL(`https://clicktok.xyz/v/${tiktok.aweme_detail.aweme_id}`)
          .setLabel("Download (Video)")
          .setStyle(ButtonStyle.Link)
          .setEmoji("🎥")
      ),
    ],
    ephemeral: true,
  });

  await logConversion(
    {
      user: interaction.user,
      guild: interaction.guild,
      tiktok:
        interaction.message.content.split("/")[
          interaction.message.content.split("/").length - 1
        ],
    },
    "Info",
    tiktok.aweme_detail.video.cover.url_list[0],
    interaction.channel as TextChannel
  ).catch(console.error);
}
