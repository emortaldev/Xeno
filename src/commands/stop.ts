import {getVoiceConnection} from "@discordjs/voice";
import {ChatInputCommandInteraction, Client, SlashCommandBuilder} from "discord.js";
import {queue} from "./play";

export const data = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Clears the queue and stops the music")

export async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply("This command can only be used in a server")
        return;
    }

    queue.delete(guildId)
    let connection = getVoiceConnection(guildId);
    if (connection) {
        connection.destroy();
    }

    interaction.reply("Stopped")
}