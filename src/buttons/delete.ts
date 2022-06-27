import { ButtonInteraction, Message } from "discord.js";

export default function (interaction: ButtonInteraction) {
  (interaction.message as Message).delete();
}
