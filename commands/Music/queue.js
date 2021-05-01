const ms = require("../../util/msparse");
const { queue } = require("../../util/storage");

module.exports.run = async (_, message) => {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue || !serverQueue.songs) return message.channel.send("No music is playing!");

    let i = 0, qLength = 0;

    const songList = serverQueue.songs.slice(0, 10);
    
    songList.map(async song => qLength += song.length);

    let description = songList.map(song => `${i++ + 1} - [${song.title}](https://youtu.be/${song.id}) \`${ms(song.length)}\``).join("\n");
    if (serverQueue.songs.length > 10) description += `\nand ${serverQueue.songs.length - 10} more...`;

    message.channel.send({
        embed: {
            title: `Queue \`${ms(qLength)}\``,
            description,
            color: 0x7289DA
        }
    });
};

module.exports.config = {
    aliases: ["qu", "q"],
    description: "Shows the queue"
};