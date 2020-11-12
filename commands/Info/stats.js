const ms = require("../../msparse");

module.exports.run = async (client, message) => {
    const heapUsed = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
    const rssUsed = Math.floor(process.memoryUsage().rss / 1024 / 1024);

    message.channel.send({
        embed: {
            fields: [
                { name: "Ping", value: `🖥️ Ping \`${client.ws.ping}ms\`\n⏱️ Uptime \`${ms(Math.floor(client.uptime / 1e3) * 1e3)}\``, inline: true },
                { name: "Usage", value: `RAM Used \`${heapUsed} MB\`\nRAM Allocated \`${rssUsed} MB\``, inline: true }
            ],
            color: 0x7289DA,
            footer: { text: `${client.guilds.cache.size} servers` }
        }
    });
};

module.exports.config = {
    aliases: ["ping", "latency", "uptime", "mem", "memory", "performance"],
    description: "Shows stats"
};