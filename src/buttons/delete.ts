import { ButtonInteraction, Message, Permissions } from "discord.js";

export default async function (interaction: ButtonInteraction) {
  const userThatCanDelete = await interaction.client.users.fetch(
    interaction.customId.split("-")[1]
  );

  if (
    interaction.user.id != userThatCanDelete.id &&
    !interaction.memberPermissions.has(Permissions.FLAGS.ADMINISTRATOR)
  )
    return await interaction.reply({
      content:
        "Only the user who converted that tiktok or someone with administrator privileges is able to delete that message.",
      ephemeral: true,
    });

  await (interaction.message as Message)
    .delete()
    .catch((e) => interaction.reply({ content: "Oops! It looks like I don't have permission to manage messages to delete this message", ephemeral: true }));
}
