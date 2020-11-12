const { queue } = require("../../storage");
const ytdl = require("ytdl-core");

module.exports.run = async (client, message) => {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue || !serverQueue.songs) return message.channel.send("No music is playing!");

    const info = await ytdl.getBasicInfo(serverQueue.songs[0].id);
    const formats = info.formats.map(f => f.itag);

    message.channel.send("The current song is using format " + formats.includes(258) || formats.includes(256) ? "high" : formats.includes(22) ? "medium" : "low");
};

module.exports.config = {
    description: "Shows basic information about the current playback quality",
    aliases: ["bitrate"]
};