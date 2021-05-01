const ytdl = require("ytdl-core-discord");
const ms = require("../../util/msparse");
const cacheutil = require("../../util/videoutil");

const { queue } = require("../../util/storage");


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
    const song = await cacheutil.getVideo(url);

    if (!queue.has(message.guild.id)) {
        queue.set(message.guild.id, {
            songs: [song],
            volume: 100
        });

        play(song, message.channel, message.member.voice.channel);

        message.channel.send(`Now playing: **${song.title}** \`${ms(song.length)}\``);
    } else {
        serverQueue.songs.push(song);
        message.channel.send(`**${song.title}** has been added to the queue!`);
    }
        
};

async function play(song, tc, vc, connection) {
    if (!connection) connection = await vc.join();

    connection.once("disconnect", () => {
        queue.delete(tc.guild.id);
    });

    const serverQueue = queue.get(tc.guild.id);

    const dispatcher = connection.play(await ytdl(song.id, { quality: "highestaudio", highWaterMark: 1 << 24 }), { type: "opus", volume: serverQueue.volume / 100, bitrate: 256 });

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