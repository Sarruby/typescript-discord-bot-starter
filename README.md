# typescript-discord-bot-starter

This repo is designed to be a starter repo for M so M can easily make bots. I guess you can too.

# Quickstart from this repository

## Setup

1.  Clone this repo.
2.  npm install (?) it.
3.  Edit details of package.json to be your project.
4.  [Follow instructions](https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial) for getting a bot token. Put bot token in .env file (see .env.example for formatting).
5.  Delete this README.md.

# Overview

Details for anyone looking to use this.

This is cribbed from instructions from <https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial>.

## Bot functionality to start

This bot starts with two commands: `ping` and `erase`. It only performs these commands when in a generic room's channel named `console`. DMs, pings from other channels, and nonexistent commands are all rejected (replied to with a hopefully helpful message).

## Code layout

The main bot code is in `src`.
*   `index.ts`: thin wrapper for `bot.ts`.
*   `bot.ts`: handles login logistics and registration of event listeners.
*   `inversify.config.ts` + `types.ts`: this project uses inject to simplify some of importing. (This is mostly an artifact left from the instructions above, although I couldn't figure out how to write an integration test with it, sadly. Still, I left it because it makes message-handler pretty simple to read, I think.)
*   `services/`: main logic for commands/message handling.
    *   `message-handler.ts`: checks incoming messages for validity (is from "console" channel) and calls appropriate command.
    *   `message-commands`: where the actual command implementations are.
        *   `flag-command-base.ts`: some boiler plate for parsing incoming messages into flags and handling errors.
        *   `ping.ts`, `erase.ts`: some example commands.

## Scripts

Here are package.json's scripts (run with `npm run <script>`):
*   `start`: run the bot. (Must `build` first.)
*   `lint`: run the linter without making changes.
*   `fix`: run the linter, fixing what it can.
*   `watch`: compile the typescript, watching for changes.
*   `clean`: delete node_modules/ and build/ contents. You must `npm install` after using this command.
*   `build`: compile the typescript.
*   `test`: run unit tests under tests/.

### Adding features

Put new services in src/services/. Add tests for those services in tests/services/.

Adding a new command? You should look at commit history and look for a commit with "NEW COMMAND" to see what I did to add a new command.

Adding a new listener? You'll need to edit bot.ts and add a new handler under src/services.

Adding something else? Good luck, and let me know if there's something in the structure of this code base that hindered you, please?

### Error handling

Only reject promises when a serious error (e.g. client nonexistent) has occurred; in general, if a helpful message has been replied with, or otherwise human error was handled, consider it handled. Or, resolve with empty `Promise<Message[]>`.

If you write a new command, throw errors to reply with the usage message. (See "ping" command in src/services/message-commands/erase.ts for what happens when --number is poorly specified.)

### Integration testing

I haven't figured out how to mock out a discord server, but you can manually test by running `npm run test` and then trying every action noted in the tests.
