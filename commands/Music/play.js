const ytdl = require("ytdl-core")
    , ms = require("../../msparse")
    , { search } = require("scrape-yt")
    , { queue } = require("../../storage");

async function play(song, tc, vc, connection) {
    tc.send(`:notes: **${song.title}** \`${ms(song.length * 1000)}\``);

    if (!connection) connection = await vc.join();

    connection.once("disconnect", () => {
        queue.delete(tc.guild.id);
    });

    const serverQueue = queue.get(tc.guild.id);
    const dispatcher = connection.play(ytdl(song.id, { quality: "highestaudio", highWaterMark: 1 << 24 }), { volume: serverQueue.volume / 100, bitrate: 160 });

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

module.exports.run = async (client, message, args) => {
    if (args.length == 0) return message.channel.send("Please specify a valid YouTube search query, url or ID!");
    if (!message.member.voice.channelID) return message.channel.send("Please join a voice channel!");

    const url = args.join(" ");
    let song = {};

    if (ytdl.validateURL(url) || ytdl.validateID(url)) {
        const info = await ytdl.getBasicInfo(url).catch(() => { return undefined; });
        if (!info) return message.channel.send("No results");

        song = {
            title: info.videoDetails.title,
            id: info.videoDetails.videoId,
            length: info.videoDetails.lengthSeconds
        }
    } else {
        let results = await search(url, { type: "video", limit: 1, useWorkerThread: true });
        if (results.length == 0) return message.channel.send("No results");
        results = results[0];

        song = {
            title: results.title,
            id: results.id,
            length: results.duration
        }
    }

    if (!queue.has(message.guild.id)) {
        queue.set(message.guild.id, {
            songs: [song],
            volume: 100
        });

        play(song, message.channel, message.member.voice.channel);
    } else {
        message.channel.send(`:white_check_mark: **${song.title}** \`${ms(song.length * 1000)}\``);
        queue.get(message.guild.id).songs.push(song);
    }
};

module.exports.config = {
    aliases: ["p", "music", "song"],
    description: "Plays music"
};
