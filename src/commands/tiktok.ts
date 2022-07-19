import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import axios from "axios";
import getTikTokResponse, { getIdFromText, Type } from "../utils/handleTikTok";
import validTikTokUrl from "../utils/validTikTokUrl";
import { logError } from "../utils/logger";
export default {
  data: new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("Convert a TikTok into a easily viewable Discord video.")
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("The TikTok link you want to covert")
        .setRequired(true)
    ),
  run: async function run(interaction: CommandInteraction) {
    if (!validTikTokUrl(interaction.options.get("link").value as string)) {
      await interaction.reply({
        content: "Invalid TikTok link.",
        ephemeral: true,
      });
      return;
    }
    interaction.deferReply().catch((e) => logError(e, interaction));
    await axios
      .get(
        `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${await getIdFromText(
          interaction.options.get("link").value as string
        )}`
      )
      .then(async (response) => {
        await interaction.editReply(
          await getTikTokResponse(
            Type.COMMAND,
            response.data,
            interaction.user,
            interaction.guild,
            interaction.channel as TextChannel
          )
        );
      })
      .catch(async (e) => {
        await interaction.editReply({
          content: "Invalid TikTok link.",
        });
      });
  },
};
