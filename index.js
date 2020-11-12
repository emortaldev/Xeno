const { Client } = require("discord.js-light")
    , { prefix, token, clientOpt } = require("./config.json")
    , { commands, aliases, loadCommands } = require("./storage")
    , client = new Client(clientOpt);

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