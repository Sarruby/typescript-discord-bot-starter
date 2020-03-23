// eslint-disable-next-line no-unused-vars
import {Message, Client, TextChannel} from 'discord.js';
// eslint-disable-next-line no-unused-vars
import {inject, injectable} from 'inversify';
import {TYPES} from '../types';
// eslint-disable-next-line no-unused-vars
import {CommandDetection, FlagCommandBase}
  from './message-commands/flag-command-base';

@injectable()
/** Handles messages. Consists of a bunch of installed commands/listeners. */
export class MessageHandler {
  private client: Client;
  private commands: FlagCommandBase[];

  /**
    * Installs the listeners
    * @param {Client} client - Discord client.
    * @param {FlagCommandBase} pingCommand - ping
    * @param {FlagCommandBase} eraseCommand - erase
    */
  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.PingCommand) pingCommand: FlagCommandBase,
    @inject(TYPES.EraseCommand) eraseCommand: FlagCommandBase,
  ) {
    this.commands = [pingCommand, eraseCommand];
    this.client = client;
  }

  /**
    * Handles new messages.
    * @param {Message} message - The message to handle.
    * @return { { isOk:boolean, promise:Promise<Message | Message[]> } } -
    * When isOk is true, continue. If !isOk, the promise represents the action,
    * if any, that was taken in response to the message. The promise is
    * rejected when there is an error where there is something seriously wrong.
    * Otherwise, the promise is possibly the promise of a reply or an empty
    * array (since no action was taken);
    */
  validityCheck(message: Message):
    { isOk:boolean, promise:Promise<Message | Message[]>} {
    // Ignore other bots + self.
    if (message.author.bot == true) {
      return {isOk: false, promise: Promise.resolve([])};
    }
    // Some checks below rely on user.
    if (this.client.user == null) {
      return {isOk: false, promise: Promise.reject(
          new Error(
              'ERROR: somehow the client.user is null!' +
          ' Consider restarting.'))};
    }

    // Only consider text channels.
    // If Direct Messaged, tell user we can't do anything.
    if (message.channel.type != 'text') {
      if (message.channel.type == 'dm') {
        return {isOk: false, promise: message.reply(
            'Sorry, I am unequipped to handle direct messages.',
        )};
      }
      // Docs say type will be text or dm but just in case we have this.
      // Not unit tested.
      return {isOk: false, promise: Promise.resolve([])};
    }

    // Only reply if the channel is exactly "console".
    // If users try to message the bot with @bot, tell them the bot is limited.
    const textChannel:TextChannel = message.channel;
    if (textChannel.name != 'console') {
      if (message.mentions.users.has('' + this.client.user.id) == true) {
        return {isOk: false, promise: message.reply(
            'Sorry, I have very limited use for admins only, and will only ' +
            'respond with this message when mentioned.',
        )};
      }
      return {isOk: false, promise: Promise.resolve([])};
    }

    // When the messsage is in the console, don't let mentions of
    // the bot interfere with
    // the raw text input.
    if (message.mentions.users.has('' + this.client.user.id) == true) {
      return {isOk: false, promise: message.reply(
          'When using the console, do not @bot - just type the commands.',
      )};
    }

    return {isOk: true, /* ignore */promise: Promise.resolve([])};
  }

  /**
    * Handles new messages.
    * @param {Message} message - The message to handle.
    * @return { Promise<Message | Message[]>} - Whatever the handler gives back.
    */
  handle(message: Message): Promise<Message | Message[]> {
    const validityCheck:{ isOk:boolean, promise:Promise<Message | Message[]>} =
     this.validityCheck(message);
    if (!validityCheck.isOk) {
      return validityCheck.promise;
    }

    for (const command of this.commands) {
      if (command.isCommandCalled(message) ==
          CommandDetection.COMMAND_CALLED) {
        return command.doCommand(message);
      }
    }

    return message.reply('Unknown command! TODO(M) Make list.');
  }
}
