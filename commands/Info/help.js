const { commands } = require("../../storage");

module.exports.run = async (client, message) => {
    let fields = [];

    commands.filter((cmd) => cmd.command.config.description != "HIDE").forEach((cmd, cmdname) => {
        if (!fields.filter(e => e.name == `${cmd.category}`).length > 0) fields.push({ name: `${cmd.category}`, value: "" });

        fields.filter(field => field.name == `${cmd.category}`)[0].value += `\`${cmdname}\` ${cmd.command.config.description}\n`;
    });

    message.channel.send({
        embed: {
            title: `${client.user.username} Help`,
            fields,
            color: 0x7289DA
        }
    });
};

module.exports.config = {
    aliases: ["?", "commands", "cmds"],
    description: "HIDE"
};