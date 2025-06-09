import {Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes} from "discord.js"
import fs from "fs"
import path from "path"

const { token, guildId } = require('../config.json') as { token: string, guildId: string };

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

export const commands: Collection<String, any> = new Collection();

// Load commands
async function loadCommands() {
	console.log("Loading commands")
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
loadCommands()
// client.on(Events.Debug, console.log);

client.once(Events.ClientReady, c => {
	deployCommands(c.user.id)
	console.log(`Logged in as ${c.user.tag}`);
	console.log(`Invite bot with: https://discord.com/api/oauth2/authorize?client_id=${c.user.id}&permissions=3145728&scope=bot`)
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

const rest = new REST().setToken(token);
async function deployCommands(clientId: string) {
	try {
		console.log(`Deploying ${commands.size} commands.`);

		const deployCommands: string[] = [];
		for (let command in commands) {
			deployCommands.push(commands.get(command).data.toJSON());
		}

		await rest.put(
			// Routes.applicationCommands(clientId),
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: deployCommands },
		);
	} catch (error) {
		console.error(error);
	}
}


void client.login(token);