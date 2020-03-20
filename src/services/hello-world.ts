import {Message} from 'discord.js';  // eslint-disable-line no-unused-vars

/**
 * Installs the listeners
 * @param {Discord.Client} client - The client that will boot.
 */
export class helloWorldResponder {
  /**
    * Installs the listeners
    * @param {Discord.Message} message - The message to reply to.
    * @return {Promise < Message | Message[] >} - The replied message.
    */
  helloWorldEcho(message:Message): Promise < Message | Message[] > {
    return message.reply('Hello world!');
  }
}
