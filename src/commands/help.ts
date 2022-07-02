import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("If you require assistance, use this command."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content:
        "For any type of assistance needed please join our support server \nhttps://clicktok.xyz/support",
      ephemeral: true,
    });
  },
};
