import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Sends the link to the vote page for the bot."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content: "https://discordbots.org/bot/564990989842791424/vote",
      ephemeral: true,
    });
  },
};
