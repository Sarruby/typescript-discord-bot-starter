// eslint-disable-next-line no-unused-vars
import {Message, Client} from 'discord.js';
import {FlagCommandBase} from './flag-command-base';
// eslint-disable-next-line no-unused-vars
import {OptionDefinition, CommandLineOptions} from 'command-line-args';
import {injectable, inject} from 'inversify';
import {TYPES} from '../../types';

@injectable()
/** PingFinder. */
export class EraseCommand extends FlagCommandBase {
  flagOptions: OptionDefinition[] = [
    {name: 'number'},
  ];
  usage:string = 'erase --number (#). '+
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
    * Pong author or ping other user.
    * @param {Message} message - Incoming message.
    * @param {CommandLineOptions} options - if flag "user" provided, that.
    * @return {Promise<Message | Message[]>} - the promise from replying.
    */
  completeParsedCommand(
      message: Message,
      options: CommandLineOptions): Promise<Message | Message[]> {
    if (options.number == null) {
      throw new Error();
    }
    return message.reply('ERASE!' + options.number);
  }
}
