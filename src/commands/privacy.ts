import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("privacy")
    .setDescription("Sends the link to the Privacy Policy page on our website."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content: "https://clicktok.xyz/privacypolicy.pdf",
      ephemeral: true,
    });
  },
};
