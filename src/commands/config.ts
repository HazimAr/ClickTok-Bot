import { SlashCommandBuilder } from "@discordjs/builders";
import { PrismaClient } from "@prisma/client";
import { CommandInteraction, MessageEmbed } from "discord.js";

const prisma = new PrismaClient();

export default {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure the bot for your server.")
    .addBooleanOption((option) =>
      option
        .setName("auto_embed")
        .setDescription(
          "Auto embed any TikTok found in any message sent to the server. (Default: true)"
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("delete_origin")
        .setDescription(
          "Delete the original message if a TikTok is found in it after sending the embed. (Default: false)"
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("suppress_embed")
        .setDescription(
          "Remove the original embed discord gives when a TikTok link is found in a message. (Default: true)"
        )
    ),
  run: async function run(interaction: CommandInteraction) {
    const mongoGuild = await prisma.guild.findFirst({
      where: { id: interaction.guild.id },
    });

    const settings = mongoGuild.settings;

    const auto_embed = interaction.options.get("auto_embed")?.value;

    if (auto_embed != undefined) {
      if (auto_embed == true) settings.autoEmbed = true;
      else settings.autoEmbed = false;
    }

    const delete_origin = interaction.options.get("delete_origin")?.value;

    if (delete_origin != undefined) {
      if (delete_origin == true) settings.deleteOrigin = true;
      else settings.deleteOrigin = false;
    }

    const suppress_embed = interaction.options.get("suppress_embed")?.value;

    if (suppress_embed != undefined) {
      if (suppress_embed == true) settings.suppressEmbed = true;
      else settings.suppressEmbed = false;
    }

    await prisma.guild.update({
      where: { id: interaction.guild.id },
      data: {
        settings: {
          set: settings,
        },
      },
    });

    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Current Settings!")
          .addField("auto_embed", `${settings.autoEmbed}`, true)
          .addField("delete_origin", `${settings.deleteOrigin}`, true)
          .addField("suppress_embed", `${settings.suppressEmbed}`, true),
      ],
      ephemeral: true,
    });
  },
};
