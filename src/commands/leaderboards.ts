import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboards")
    .setDescription("Sends the link to the leaderboard page on the website."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content: `<https://clicktok.xyz/leaderboards/${interaction.guild.id}>`,
      ephemeral: true,
    });
  },
};
