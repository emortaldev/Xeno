import {ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder} from "discord.js";
import {queue} from "./play";

export const data = new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue")

export async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({
            content: "This can only be used on a server",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const songs = queue.get(guildId);
    if (!songs || songs.length == 0) {
        interaction.reply({
            content: "There is nothing playing",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    queue.set(guildId, shuffle(songs))

    interaction.reply("Shuffled!")
}

function shuffle(a: any[]): any[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}