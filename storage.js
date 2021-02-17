const { Collection } = require("discord.js-light");
const glob = require("tiny-glob");
const commands = new Collection();
const queue = new Collection();
const directorySlash = process.platform == "win32" ? "\\" : "/"

module.exports = {
    commands,
    queue,
    loadCommands: async () => {
        const files = await glob("commands/*/*.js");

        files.forEach(async (file) => {
            const command = require(`./${file}`);
            const splitter = file.split(directorySlash);

            commands.set(splitter[2].slice(0, -3), {
                command,
                category: splitter[1],
            });

            delete require.cache[require.resolve(`./${file}`)];
        });
    },
    getCommand: (commandName) => {
        const cmd = commands.get(commandName);
        if (cmd != null) return cmd;

        for (const cmd of commands)
            if (cmd[1].command.config.aliases.includes(commandName)) return cmd[1];
    }
};
