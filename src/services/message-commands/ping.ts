// eslint-disable-next-line no-unused-vars
import {Message, Client} from 'discord.js';
import {FlagCommandBase} from './flag-command-base';
// eslint-disable-next-line no-unused-vars
import {OptionDefinition, CommandLineOptions} from 'command-line-args';
import {injectable, inject} from 'inversify';
import {TYPES} from '../../types';

@injectable()
/** PingFinder. */
export class PingCommand extends FlagCommandBase {
  flagOptions: OptionDefinition[] = [
    {name: 'user'},
  ];
  usage:string = 'ping --user (someone). '+
    'If you use a mention I will too.';
  maxFlagsPossible: number = 2;
  commandString: string = 'ping';

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
    if (options.user != null) {
      const reply:string =
          options.user + ', ping! From '+
          '<@!' + message.author.id + '>';
      return message.channel.send(reply);
    }
    return message.reply('Pong!');
  }
}
