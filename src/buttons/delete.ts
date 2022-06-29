import { ButtonInteraction, Message } from "discord.js";

export default async function (interaction: ButtonInteraction) {
  await (interaction.message as Message).delete();
}
