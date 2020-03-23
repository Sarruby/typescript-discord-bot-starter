// eslint-disable-next-line no-unused-vars
import {Client, Message} from 'discord.js';
// eslint-disable-next-line no-unused-vars
import commandLineArgs, {OptionDefinition, CommandLineOptions}
  from 'command-line-args';
import {injectable, inject} from 'inversify';
import {TYPES} from '../../types';


export enum CommandDetection {
  COMMAND_CALLED, // eslint-disable-line no-unused-vars
  ERROR_WARNED_USER, // eslint-disable-line no-unused-vars
  NOT_APPLICABLE, // eslint-disable-line no-unused-vars
}

@injectable()
/** PingFinder. */
export abstract class FlagCommandBase {
  discordClient:Client;

  // The command to be typed in. e.g. "ping"
  abstract commandString:string;

  // If the flag takes options, specify here. e.g. {name: "flag"}
  // See documentation:
  // https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md
  abstract flagOptions:OptionDefinition[];

  // In the event of user error/an unparseable string, an error message.
  // Note: since we use typescript, we can't use command-line-usage as
  // we cannot add field 'description' to flagOptions. :-(
  abstract usage:string;

  // Throws an error to reply with usage message.
  // This should do whatever is needed. Like, reply, ping, react, delete, etc.
  abstract completeParsedCommand(
    message: Message, options:CommandLineOptions): Promise<Message | Message[]>;

  /**
    * Instantiate bot.
    * @param {Client} discordClient - Discord client.
    */
  constructor(@inject(TYPES.Client) discordClient: Client) {
    this.discordClient = discordClient;
  }

  /**
    * Installs the listeners
    * @param {Message} message - The message to reply to.
    * @return {CommandDetection} - Whether the string was found.
    */
  public isCommandCalled(message:Message): CommandDetection {
    if (message.content.search(this.commandString) < 0) {
      return CommandDetection.NOT_APPLICABLE;
    }
    return CommandDetection.COMMAND_CALLED;
  }

  /**
    * @param {Message} message - The message to reply to.
    * @return {Promise<Message | Message[]>} - Replied message(s).
    */
  doCommand(message: Message): Promise<Message | Message[]> {
    if (message.content == null) {
      return Promise.reject(new Error('Null content for message!'));
    }

    let messageArgv:string[] = message.content.split(
        ' ', this.flagOptions.length*2 + 1);
    const indexOfCommand = messageArgv.findIndex((word) => {
      return word ==this.commandString;
    });
    messageArgv = messageArgv.slice(indexOfCommand+1);

    let parsedFlags:CommandLineOptions;
    try {
      parsedFlags = commandLineArgs(this.flagOptions, {argv: messageArgv});
      return this.completeParsedCommand(message, parsedFlags);
    } catch (e) {
      // Note: typescript does not allow us to add "description" to our
      // option definitions since the field is not present in the class.
      // Thus, we cannot use command-line-usage.
      const errorAndUsage =
        'BeEP bOoP ErRor!' +
        '\n\nCould complete `' + this.commandString + '` command.' +
        '\n\nUser: ' + message.author.username +
        '\nMessage:\n```\n' + message.content + '\n```' +
        '\n\nUsage:\n' + this.usage;
      return message.reply(errorAndUsage);
    }
  }
}
