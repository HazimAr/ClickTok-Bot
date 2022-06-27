import { ButtonInteraction, Message } from "discord.js";

export default function (interaction: ButtonInteraction) {
  // check if user has voted in the last 24 hours
  

  (interaction.message as Message).delete();
}
