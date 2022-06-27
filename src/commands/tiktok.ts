import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import axios from "axios";
import getTikTokResponse, { getIdFromText } from "../utils/handleTikTok";
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
    await axios
      .get(
        `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${getIdFromText(
          interaction.options.get("link").value as string
        )}`
      )
      .catch(console.error)
      .then((response) => {
        interaction.reply(getTikTokResponse((response as any).data));
      });
  },
};
