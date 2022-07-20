import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("donate")
    .setDescription(
      "If you would like to support clicktok, please donate here! It really helps us out!"
    ),

  run: async function run(interaction: CommandInteraction) {
    await interaction.reply({
      content:
        "If you would like to support clicktok, please donate here! It really helps us out! (Make sure to type your discord username so you can get the supporter role) https://donatebot.io/checkout/990828035420872785",
      ephemeral: true,
    });
  },
};
