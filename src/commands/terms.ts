import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("terms")
    .setDescription("Sends the link to the Terms of Use page on our website."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content: "https://clicktok.xyz/terms.pdf",
      ephemeral: true,
    });
  },
};
