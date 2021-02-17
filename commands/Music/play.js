const ytdl = require("ytdl-core-discord");
const ms = require("../../msparse");
const { search } = require("scrape-yt");
const { queue } = require("../../storage");

module.exports.run = async (_, message, args) => {
    const serverQueue = queue.get(message.guild.id);

    if (args.length == 0) {
        if (serverQueue && message.member.voice && message.member.voice.channelID == serverQueue.dispatcher.player.voiceConnection.channel.id && serverQueue.dispatcher.paused) {
            serverQueue.dispatcher.resume();
            return message.channel.send("Resumed");
        }
        return message.channel.send("Please specify a valid YouTube search query, url or ID!");
    }
    if (!message.member.voice.channelID) return message.channel.send("Please join a voice channel!");

    const url = args.join(" ");
    let song = {};

    const loadingMessage = await message.channel.send(`<a:load:811560024769429524> Loading...`);
    loadingMessage.delete({ timeout: 15000 });
    message.delete({ timeout: 15000 });

    if (ytdl.validateURL(url) || ytdl.validateID(url)) {
        const info = await ytdl.getBasicInfo(url).catch(() => { return undefined; });
        if (!info) return loadingMessage.edit("No results");

        song = {
            title: info.videoDetails.title,
            id: info.videoDetails.videoId,
            length: info.videoDetails.lengthSeconds
        }
    } else {
        let results = await search(url, { type: "video", limit: 1, useWorkerThread: true });
        if (results.length == 0) return loadingMessage.edit("No results");

        song = {
            title: results[0].title,
            id: results[0].id,
            length: results[0].duration
        }
    }


    if (!queue.has(message.guild.id)) {
        queue.set(message.guild.id, {
            songs: [song],
            volume: 100
        });

        loadingMessage.edit(`<a:loadfinished:811560317527261204> Now playing: **${song.title}** \`${ms(song.length)}\``);

        play(song, message.channel, message.member.voice.channel);
    } else {
        serverQueue.songs.push(song);
        loadingMessage.edit(`<a:loadfinished:811560317527261204> **${song.title}** has been added to the queue!`);
    }
        
};

async function play(song, tc, vc, connection) {
    if (!connection) connection = await vc.join();

    connection.once("disconnect", () => {
        queue.delete(tc.guild.id);
    });

    const serverQueue = queue.get(tc.guild.id);
    const dispatcher = connection.play(await ytdl(song.id, { quality: "highestaudio", highWaterMark: 1 << 24 }), { type: "opus", volume: serverQueue.volume / 100, bitrate: 192 });

    serverQueue.dispatcher = dispatcher;

    dispatcher.once("finish", async () => {
        serverQueue.songs.shift();
        if (serverQueue.songs[0]) {
            connection.removeAllListeners("disconnect");
            return play(serverQueue.songs[0], tc, null, connection);
        }
        serverQueue.dispatcher.player.voiceConnection.channel.leave();
    });
}

module.exports.config = {
    aliases: ["p", "music", "song"],
    description: "Plays music"
};