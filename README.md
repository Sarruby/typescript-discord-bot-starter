# typescript-discord-bot-starter
Following instructions from <https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial> to create a ping-pong bot.

# Quickstart from this repository

## Setup

1.  Clone this repo.
2.  npm install (?) it.
3.  Edit details of package.json to be your project.
4.  [Follow instructions](https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial) for getting a bot token. Put bot token in .env file (see .env.example for formatting).
5.  Delete this README.md.

## Developing

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

### Error handling

Only reject promises when a serious error (e.g. client nonexistent) has occurred; in general, if a helpful message has been replied with, or otherwise human error was handled, consider it handled. Or, resolve with empty `Promise<Message[]>`.

### Integration testing

I haven't figured out how to mock out a discord server, but you can manually test by running `npm run test` and then trying every action noted in the tests.
