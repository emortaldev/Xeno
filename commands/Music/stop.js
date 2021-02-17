const { queue } = require("../../storage");

module.exports.run = async (_, message) => {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) return message.channel.send("No music is playing!");
    if (!message.member.voice || message.member.voice.channelID != serverQueue.dispatcher.player.voiceConnection.channel.id)
        return message.channel.send("You need to be in the same voice channel as me!");

    serverQueue.dispatcher.destroy();
    serverQueue.dispatcher.player.voiceConnection.channel.leave();
};

module.exports.config = {
    aliases: ["leave"],
    description: "Stops music"
};