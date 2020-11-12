const { queue } = require("../../storage");

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports.run = async (client, message) => {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) return message.channel.send("No music is playing!");
    if (!message.member.voice || message.member.voice.channelID != serverQueue.dispatcher.player.voiceConnection.channel.id) return message.channel.send("You need to be in the same voice channel as me!");

    const firstItem = serverQueue.songs[0];
    
    serverQueue.songs.shift();

    const shuffledSongs = shuffle(serverQueue.songs);

    shuffledSongs.unshift(firstItem);

    serverQueue.songs = shuffledSongs;

    message.channel.send(":arrows_counterclockwise: Shuffled the queue!");
};



module.exports.config = {
    description: "Shuffles the queue",
    aliases: ["shuf", "randomize", "randomise"]
};