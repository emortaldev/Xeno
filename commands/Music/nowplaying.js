const ms = require("../../msparse");
const { queue } = require("../../storage");

module.exports.run = async (_, message) => {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue || !serverQueue.songs) return message.channel.send("No music is playing!");

    const { title, length, id } = serverQueue.songs[0];
    let description = `Currently playing: [${title}](https://youtu.be/${id}) \`${ms(length)}\` ${serverQueue.dispatcher.paused ? " (PAUSED)" : ""}`;

    message.channel.send({
        embed: {
            description: description,
            color: 0x7289DA
        }
    });
};

module.exports.config = {
    aliases: ["np"],
    description: "Shows the current song"
};