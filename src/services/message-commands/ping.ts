// eslint-disable-next-line no-unused-vars
import {Message} from 'discord.js';

// For testing.
import {injectable} from 'inversify';

@injectable()
/** PingFinder. */
export class PingCommand {
  private regexp = 'ping';

  /**
    * Installs the listeners
    * @param {Message} message - The message to reply to.
    * @return {boolean} - Whether the string was found.
    */
  public isCommandCalled(message:Message): boolean {
    return message.content.search(this.regexp) >= 0;
  }

  /**
    * @param {Message} message - The message to reply to.
    * @return {Promise<Message | Message[]>} - Replied message(s).
    */
  doCommand(message: Message): Promise<Message | Message[]> {
    return message.reply('Pong!');
  }
}
