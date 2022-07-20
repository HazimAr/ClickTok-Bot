import { SlashCommandBuilder } from "@discordjs/builders";

import { CommandInteraction, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("notification")
    .setDescription("Configure notifications for specific tiktok creators."),
  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("We Moved Notifications To The Dashboard")
          .setDescription(
            `Please visit the dashboard to configure the bot [here](https://clicktok.xyz/dashboard/${interaction.guild.id}).`
          )
          .setURL("https://clicktok.xyz/dashboard")
          .setColor("#00ff00"),
      ],
      ephemeral: true,
    });
  },
};
