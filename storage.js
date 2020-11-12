const { Collection } = require("discord.js-light")
    , glob = require("tiny-glob")
    , commands = new Collection()
    , aliases = new Collection()
    , queue = new Collection();

module.exports = {
    commands,
    aliases,
    queue,
    loadCommands: async () => {
        const fileSlash = process.platform == "win32" ? "\\" : "/"
        const files = await glob("commands/*/*.js");

        files.forEach(async (file) => {
            const command = require(`./${file}`);
            const splitter = file.split(fileSlash);

            commands.set(splitter[2].slice(0, -3), {
                command,
                category: splitter[1]
            });
            if (command.config.aliases) command.config.aliases.forEach(a => aliases.set(a, splitter[2].slice(0, -3)));

            delete require.cache[require.resolve(`./${file}`)];
        });
    },
};
