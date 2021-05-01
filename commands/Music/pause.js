const { queue } = require("../../util/storage");

module.exports.run = async (_, message) => {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) return message.channel.send("No music is playing!");
    if (!message.member.voice || message.member.voice.channelID != serverQueue.dispatcher.player.voiceConnection.channel.id)
        return message.channel.send("You need to be in the same voice channel as me!");

    if (serverQueue.dispatcher.paused) serverQueue.dispatcher.resume();
    else serverQueue.dispatcher.pause(true);

    message.channel.send(serverQueue.dispatcher.paused ? "Paused" : "Resumed");
};

module.exports.config = {
    aliases: ["resume", "unpause"],
    description: "Toggles playback"
};