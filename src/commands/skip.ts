import {getVoiceConnection} from "@discordjs/voice";
import {ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder} from "discord.js";
import {playerMap, playNextInQueue} from "./play";

export const data = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips to the next song in the queue")

export async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({
            content: "This can only be used on a server",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const connection = getVoiceConnection(guildId);
    const player = playerMap.get(guildId);
    if (!connection || !player) {
        interaction.reply({
            content: "Nothing is playing",
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    interaction.reply("Skipping...")

    playNextInQueue(interaction, player)
}