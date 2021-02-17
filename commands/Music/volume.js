const { queue } = require("../../storage");

module.exports.run = async (_, message, args) => {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) return message.channel.send("No music is playing!");
    if (!message.member.voice || message.member.voice.channelID != serverQueue.dispatcher.player.voiceConnection.channel.id)
        return message.channel.send("You need to be in the same voice channel as me!");

    const newVol = parseInt(args[0]);

    if (isNaN(newVol) || newVol > 100 || newVol < 0) return message.channel.send("Please specify a number between `1` and `100`");

    serverQueue.dispatcher.setVolume(newVol / 100);
    serverQueue.volume = newVol;
};

module.exports.config = {
    aliases: ["v", "vol"],
    description: "Changes volume"
};