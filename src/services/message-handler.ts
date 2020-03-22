// eslint-disable-next-line no-unused-vars
import {Message, Client} from 'discord.js';
// eslint-disable-next-line no-unused-vars
import {PingCommand} from './message-commands/ping';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';

@injectable()
/** Handles messages. Consists of a bunch of installed commands/listeners. */
export class MessageHandler {
  private client: Client;
  private pingCommand: PingCommand;

  /**
    * Installs the listeners
    * @param {PingCommand} pingCommand - PingCommand listener.
    */
  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.PingCommand) pingCommand: PingCommand,
  ) {
    this.pingCommand = pingCommand;
    this.client = client;
  }

  /**
    * Handles new messages.
    * @param {Message} message - The message to handle.
    * @return { boolean>} - Is it valid?
    */
  isValidMessage(message: Message): boolean {
    if (message.author.bot == true) {
        return false;
    }
    return true;
  }

  /**
    * Handles new messages.
    * @param {Message} message - The message to handle.
    * @return { Promise<Message | Message[]>} - Whatever the handler gives back.
    */
  handle(message: Message): Promise<Message | Message[]> {
    if (!this.isValidMessage(message)) {return Promise.reject(message);}

    if (this.pingCommand.isCommandCalled(message)) {
      return this.pingCommand.doCommand(message);
    }

    return Promise.reject(message);
  }
}
