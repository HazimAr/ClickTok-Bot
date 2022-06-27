import { MessageActionRow, MessageButton } from "discord.js";

export default function (id: string) {
  return {
    content: `https://clicktok.xyz/api/v/${id}`,
    components: [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("info")
          .setLabel("Info")
          .setStyle("PRIMARY")
          .setEmoji("🖥️"),
        new MessageButton()
          .setLabel("Download")
          .setStyle("LINK")
          .setURL(`https://clicktok.xyz/v/${id}`)
          .setEmoji("💾"),
        new MessageButton()
          .setCustomId("delete")
          .setLabel("Delete")
          .setStyle("DANGER")
          .setEmoji("🗑️")
      ),
    ],
  };
}
