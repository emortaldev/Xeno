const ytdl = require("ytdl-core-discord");
const { Client } = require("youtubei");
const youtube = new Client();
const chalk = require('chalk');

module.exports = {
    getVideo: async (query) => {
        const before = Date.now();

        process.stdout.write(chalk.gray(`\nProcessing query ${chalk.magentaBright.underline(query)}...\n`));

        if (ytdl.validateURL(query) || ytdl.validateID(query)) {
            const info = await youtube.getVideo(query);
    
            if (!info) {
                process.stdout.write(chalk.red(`No results for URL/ID ${chalk.redBright.underline(query)}\n`))
                return message.channel.send("No results");
            }
    
            process.stdout.write(chalk.green(`Found video ${chalk.greenBright.underline(info.title)}`) + chalk.bgGray.black(`\nTOOK ${Date.now() - before}MS\n`));

            return {
                title: info.title,
                id: info.id,
                length: info.duration
            }
        } else {
            const videos = await youtube.search(query, {
                type: "video",
            });
    
            if (videos.length == 0) {
                process.stdout.write(chalk.red(`No results for search ${chalk.redBright.underline(query)}\n`))
                return message.channel.send("No results");
            }
    
            process.stdout.write(chalk.green(`Found video ${chalk.greenBright.underline(videos[0].title)}`) + chalk.bgGray(`\nTOOK ${Date.now() - before}MS\n`));

            return {
                title: videos[0].title,
                id: videos[0].id,
                length: videos[0].duration
            }
        }
    }
}