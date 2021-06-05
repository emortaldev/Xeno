const { Client, version } = require("discord.js-light");
const { prefix, token } = require("./config.json");
const { loadCommands, getCommand } = require("./util/storage");
const client = new Client({
    disableMentions: "everyone",
    cacheGuilds: true,
    cacheChannels: false,
    cacheOverwrites: false,
    cacheRoles: false,
    cacheEmojis: false,
    cachePresences: false,
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
    disabledEvents: [
        "channelCreate",
        "channelDelete",
        "channelUpdate",
        "channelPinsUpdate",
        "emojiCreate",
        "emojiDelete",
        "emojiUpdate",
        "guildBanAdd",
        "guildBanRemove",
        "guildIntegrationsUpdate",
        "guildUnavailable",
        "guildUpdate",
        "guildMemberAdd",
        "guildMemberRemove",
        "guildMembersChunk",
        "guildMemberSpeaking",
        "guildMemberUpdate",
        "inviteCreate",
        "inviteDelete",
        "messageDelete",
        "messageUpdate",
        "messageDeleteBulk",
        "messageReactionAdd",
        "messageReactionRemove",
        "messageReactionRemoveAll",
        "messageReactionRemoveEmoji",
        "roleCreate",
        "roleDelete",
        "roleUpdate",
        "shardDisconnect",
        "shardError",
        "shardReady",
        "shardReconnecting",
        "shardResume",
        "presenceUpdate",
        "rateLimit",
        "typingStart",
        "userUpdate",
        "voiceStateUpdate",
        "warn",
        "debug",
        "error",
        "webhookUpdate"
    ]
});

process.stdout.write(`Discord.JS Version: ${version}\nXeno Version: ${require("./package.json").version}\nStarting...\n\n`)

client.login(token).catch(console.error);
loadCommands();

client
    .on("ready", async () => {
        process.stdout.write(`Bot is now ready! Logged in as ${client.user.username}\n`);
    })

    .on("message", async (msg) => {
        if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type != "text") return;

        const args = msg.content.split(/ +/);
        const cmd = getCommand(args[0].toLowerCase().slice(prefix.length));

        if (cmd) cmd.command.run(client, msg, args.slice(1));
    });
