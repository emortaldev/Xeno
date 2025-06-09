import {ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder} from "discord.js";
import {queue} from "./play";

export const data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Displays the queue")

export async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({
            content: "This can only be used on a server",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // TODO: show currently playing

    const songs = queue.get(guildId) as any;
    if (!songs || songs.length == 0) {
        interaction.reply({
            content: "There is nothing in the queue",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const shorterSongs = songs.slice(0, 20);

    let messageContent = ""
    shorterSongs.forEach(song => {
        // messageContent += `${song.title} by ${song.channel} (\`${song.durationRaw}\`)\n`
        messageContent += `- ${song.title}\n`
    })
    if (songs.length > 20) {
        messageContent += `\n*and ${songs.length - 20} more...*`
    }

    interaction.reply(messageContent)
}