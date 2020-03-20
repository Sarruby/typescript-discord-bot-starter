// eslint-disable-next-line no-unused-vars
import {Message} from 'discord.js';
// eslint-disable-next-line no-unused-vars
import {PingCommand} from './message-commands/ping';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';

@injectable()
/** Handles messages. Consists of a bunch of installed commands/listeners. */
export class MessageHandler {
  private pingCommand: PingCommand;

  /**
    * Installs the listeners
    * @param {PingCommand} pingCommand - PingCommand listener.
    */
  constructor(
    @inject(TYPES.PingCommand) pingCommand: PingCommand,
  ) {
    this.pingCommand = pingCommand;
  }

  /**
    * Handles new messages.
    * @param {Message} message - The message to handle.
    * @return { Promise<Message | Message[]>} - Whatever the handler gives back.
    */
  handle(message: Message): Promise<Message | Message[]> {
    if (this.pingCommand.isCommandCalled(message)) {
      return this.pingCommand.doCommand(message);
    }

    return Promise.reject(message);
  }
}