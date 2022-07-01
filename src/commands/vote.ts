import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Sends the link to the vote page for the bot."),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content: "https://discordbots.org/bot/990688037853872159/vote",
      ephemeral: true,
    });
  },
};
