# typescript-discord-bot-starter
Following instructions from <https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial> to create a ping-pong bot.

# Quickstart from this repository

## Setup

1.  Clone this repo.
2.  npm install (?) it.
3.  Edit details of package.json to be your project.
4.  [Follow instructions](https://www.toptal.com/typescript/dependency-injection-discord-bot-tutorial) for getting a bot token. Put bot token in .env file (see .env.example for formatting).
5. Delete this README.md.

## Developing

Here are package.json's scripts (run with `npm run <script>`):
*   `start`: run the bot. (Must `build` first.)
*   `lint`: run the linter without making changes.
*   `fix`: run the linter, fixing what it can.
*   `watch`: compile the typescript, watching for changes.
*   `build`: compile the typescript.
*   `test`: run unit tests under tests/.

## Adding features
Put new services in src/services/. Add tests for those services in tests/services/.

Note the following scripts (run with `npm run <script>`):
