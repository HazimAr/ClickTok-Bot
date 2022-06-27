import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import axios from "axios";
import getTikTokResponse from "../utils/getTikTokResponse";
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
        `https://clicktok.xyz/api/getId?url=${
          interaction.options.get("link").value
        }`
      )
      .catch(console.error)
      .then((response) => {
        interaction.reply(getTikTokResponse((response as any).data.id));
      });
  },
};
