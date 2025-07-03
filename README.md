# Xeno

Basic music bot written using discord.js and yt-dlp

Downloads songs fully with yt-dlp to your temp folder before playing to avoid stutter or other issues, in exchange for longer song load times.

## Self host usage

1. Download [Bun](https://bun.sh/) (or your preferred version of Node)
2. Clone the repository (Green "Code" button -> Download zip -> extract) or `git clone https://github.com/emortaldev/Xeno`
3. Download [yt-dlp](https://github.com/yt-dlp/yt-dlp)
4. Open config.json and replace TOKEN with your bot's token (https://discord.com/developers/applications)
5. Replace GUILD_ID with your server's id
6. Run with `bun run src/main.ts`
7. Invite the bot using the link shown in console
8. Use /play to play a song!

Optionally, To use YouTube Music Premium audio quality and get potentially faster downloads:
- Set your po token in config.json (https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide#with-an-account)
- Set your browser in config.json to the browser you are logged into YouTube Music with (e.g. "chrome" or "firefox") (see --cookies-from-browser in yt-dlp)

Note: Increasing your voice channel bitrate does not affect the quality of music bots
