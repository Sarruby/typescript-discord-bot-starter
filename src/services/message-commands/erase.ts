// eslint-disable-next-line no-unused-vars
import {Collection, Message, Client, GuildChannel, TextChannel,
// eslint-disable-next-line no-unused-vars
  TextBasedChannel, DMChannel, Guild, GuildChannelManager} from 'discord.js';
import {FlagCommandBase} from './flag-command-base';
// eslint-disable-next-line no-unused-vars
import {OptionDefinition, CommandLineOptions} from 'command-line-args';
import {injectable, inject} from 'inversify';
import {TYPES} from '../../types';
import {FlagCommandError, FlagErrorType} from './flag-command-error';
import {parseChannel, channelOption} from './flags/channel';

@injectable()
/** PingFinder. */
export class EraseCommand extends FlagCommandBase {
  flagOptions: OptionDefinition[] = [
    {name: 'number', type: Number},
    channelOption,
  ];
  usage:string = '`erase --number <number> [--channel <channel name>]`'+
    'Deletes messages.';
  maxFlagsPossible: number = 2;
  commandString: string = 'erase';

  /**
    * Instantiate bot.
    * @param {Client} discordClient - Discord client.
    */
  constructor(@inject(TYPES.Client) discordClient: Client) {
    super(discordClient);
  }

  /**
    * Parse a number.
    * Throws error to catch bad flag input.
    * @param {any} optionsNumber - Whatever came out of options.<flag name>
    * @return {number} - A number.
    */
  private parseNumber(optionsNumber:any): number {
    const numberToDelete = Number(optionsNumber);
    if (isNaN(numberToDelete)) {
      throw new FlagCommandError('--number is not a number!',
          FlagErrorType.USER_ERROR);
    }
    return numberToDelete;
  }

  /**
    * Pong author or ping other user.
    * @param {Message} message - Incoming message.
    * @param {CommandLineOptions} options - if flag "user" provided, that.
    * @return {Promise<Message | Message[]>} - the promise from replying.
    */
  completeParsedCommand(
      message: Message,
      options: CommandLineOptions): Promise<Message | Message[]> {
    if (options.number == null) {
      throw new FlagCommandError('Number to delete is required.',
          FlagErrorType.USER_ERROR);
    }
    const numberToDelete:number = this.parseNumber(options.number);
    const channelToDeleteFrom:TextChannel | DMChannel =
      parseChannel(options.channel, message);
    if (channelToDeleteFrom == null) {
      // Not found
      throw new FlagCommandError('Channel not found unexpectedly!',
          FlagErrorType.BOT_ERROR);
    }
    if (!(typeof channelToDeleteFrom.bulkDelete == 'function')) {
      throw new FlagCommandError('Channel wrong!', FlagErrorType.BOT_ERROR);
    }

    return channelToDeleteFrom.bulkDelete(numberToDelete)
        .then((_value: Collection<string, Message>) => {
          return Promise.resolve([]);
        })
        .catch((error:Error) => {
          return Promise.reject(new Error(
              message.author.username +
            ': <' +
            message.content +
            '>\n\n\nFailed to bulkDelete! Message:\n' +
            error.message));
        });
  }
}
