const { Client } = require("discord.js-light")
    , { prefix, token } = require("./config.json")
    , { commands, aliases, loadCommands } = require("./storage")
    , client = new Client({
        disableMentions: "everyone",
        cacheGuilds: true,
        cacheChannels: false,
        cacheOverwrites: false,
        cacheRoles: false,
        cacheEmojis: false,
        cachePresences: false,
        ws: { intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] },
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

client.login(token).catch(console.error);
loadCommands();

client
    .on("ready", async () => {
        process.stdout.write(`${client.user.username}\n`);
    })

    .on("message", async (msg) => {
        if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type != "text") return;

        const args = msg.content.split(/ +/);
        const cmd = commands.get(args[0].toLowerCase().slice(prefix.length)) || commands.get(aliases.get(args[0].toLowerCase().slice(prefix.length)));

        if (cmd) cmd.command.run(client, msg, args.slice(1));
    });
