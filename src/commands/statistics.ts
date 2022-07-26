import { SlashCommandBuilder } from "@discordjs/builders";

import { CommandInteraction, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("statistics")
    .setDescription("Configure statistics for specific tiktok creators."),
  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("We Moved Statistics To The Dashboard")
          .setDescription(
            `Please visit the dashboard to configure the bot [here](https://clicktok.xyz/dashboard/${interaction.guild.id}/statistics).`
          )
          .setColor("#00ff00"),
      ],
      ephemeral: true,
    });
  },
};
