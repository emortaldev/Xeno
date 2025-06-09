import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection
} from "@discordjs/voice";
import {ChatInputCommandInteraction, Client, MessageFlags, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {Innertube, UniversalCache} from 'youtubei.js';
import fs from 'fs';
import path from "path"
import os from 'os'
import filenamify from 'filenamify';
import {exec} from 'child_process';

const { poToken, browser } = require('../../config.json') as { poToken: string, browser: string };

const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true
});

export const queue: Map<String, Object[]> = new Map();
export const playerMap: Map<String, AudioPlayer> = new Map();

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays some music")
    .addStringOption(option => 
        option
        .setName("search")
        .setDescription("A search query or url")
        .setRequired(true)
    );

export async function execute(client: Client, interaction: ChatInputCommandInteraction) {
    const voiceAdapterCreator = interaction.guild?.voiceAdapterCreator;
    if (!voiceAdapterCreator) {
        console.error("Voice adapter creator is null");
        interaction.reply({
            content: "Voice adapter creator is null",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const guild = client.guilds.cache.get(interaction.guildId!)!
    const botMember = guild.members.cache.get(client.user!.id)!;
    const member = guild.members.cache.get(interaction.member!.user.id)!;

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
        interaction.reply({
            content: "You are not in a voice channel",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (!botMember.permissions.has([PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect]) || !voiceChannel.permissionsFor(botMember).has([PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Connect])) {
        interaction.reply({
            content: "I do not have permission to connect or speak in your channel",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    let connection = getVoiceConnection(interaction.guildId!);
    if (!connection) { // If not already connected, connect
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId!,
            adapterCreator: voiceAdapterCreator,
        });
    }

    const input = interaction.options.getString("search")!.trim();

    if (!queue.has(guild.id)) {
        queue.set(guild.id, []);

        interaction.reply(await addYouTubeToQueue(guild.id, input))

        const player = newPlayer(interaction, connection)
        playerMap.set(guild.id, player);
        
        playNextInQueue(interaction, player)

        connection.subscribe(player);
        connection.on('debug', console.log);
    } else {
        interaction.reply(await addYouTubeToQueue(guild.id, input))
    }

}

async function addYouTubeToQueue(guildId: string, query: string): Promise<string> {
    const guildQueue = queue.get(guildId)!;

    if (query.startsWith("http")) {
        const data = {
            title: query,
            url: query,
            filePath: path.join(os.tmpdir(), "balleraudio-" + filenamify(query))
        }
        guildQueue.push(data)
        return `Added **${query}** to the queue`
    }

    const search = await yt.music.search(query, { type: 'song' })

    const firstVideo = search.songs?.contents[0]!

    const url = "https://www.youtube.com/watch?v=" + firstVideo.id;
    const data = {
        title: firstVideo.title,
        url: url,
        filePath: path.join(os.tmpdir(), "balleraudio-" + filenamify(url))
    }
    guildQueue.push(data)
    return `Added **${data.title}** to the queue`
}


export async function playNextInQueue(interaction: ChatInputCommandInteraction, player: AudioPlayer) {
    const guildId = interaction.guildId!;
    
    const connection = getVoiceConnection(guildId);
    if (!connection) {
        console.error("Connection is null");
        player.stop();
        queue.delete(guildId);
        playerMap.delete(guildId);
        return;
    }

    const guildQueue = queue.get(guildId);
    if (!guildQueue) {
        console.log("No guild queue, leaving")
        connection.destroy();
        player.stop();
        queue.delete(guildId);
        playerMap.delete(guildId);
        return;
    }

    const queueItem = guildQueue.pop() as any;

    if (queueItem == undefined) { // Reached end of queue
        console.log("Reached end of queue")
        connection.destroy();
        player.stop();
        queue.delete(guildId);
        playerMap.delete(guildId);
        return;
    }


    if (!fs.existsSync(queueItem.filePath)) {
        console.log("Doesn't already exist")
        
        await downloadYouTubes(queueItem.url, queueItem.filePath)
    } else {
        console.log("Already downloaded, playing")
    }

    const resource = createAudioResource(queueItem.filePath, {
        metadata: {
            title: queueItem.title
        }
    });
    player.play(resource);
}

function newPlayer(interaction: ChatInputCommandInteraction, connection: VoiceConnection) {
    const player = createAudioPlayer({
        // behaviors: {
        //     noSubscriber: NoSubscriberBehavior.Stop
        // }
    });

    player.on(AudioPlayerStatus.Idle, () => {
        playNextInQueue(interaction, player);
    });
    player.on('error', error => {
	    console.error('Error:', error.message, 'with track', (error.resource.metadata as any).title);
        playNextInQueue(interaction, player)
    });

    connection.subscribe(player)

    return player
}

async function downloadYouTubes(videoLink: string, filePath: string) {
    const promise = new Promise<string>((resolve) => {
        let formatResult = "Unknown";

        let command = `yt-dlp ${videoLink} -o "${filePath}" -f "ba"`

        if (poToken != "" && browser != "") {
            command = `yt-dlp ${videoLink} -o "${filePath}" -f "ba" --cookies-from-browser "${browser}" --extractor-args "youtube:po_token=web_music.gvs+${poToken};player_client=web_music"`
        }

        const process = exec(command, (error, stdout, stderr) => {
        // const process = exec(, (error, stdout, stderr) => {

            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            if (stdout.includes("format(s)")) {
                formatResult = stdout.split("format(s): ")[1].split("\n")[0]
            }
            console.log(`stdout: ${stdout}`);
        });

        process.on("close", () => {
            resolve(formatResult)
        })
    })
    return await promise
}