import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import axios from "axios";
import getTikTokResponse, { getIdFromText } from "../utils/handleTikTok";
import validTikTokUrl from "../utils/validTikTokUrl";
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

    await axios
      .get(
        `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${await getIdFromText(
          interaction.options.get("link").value as string
        )}`
      )

      .then(async (response) => {
        await interaction.reply(
          await getTikTokResponse(
            (response as any).data,
            interaction.user,
            interaction.guild
          )
        );
      });
  },
};
