// eslint-disable-next-line no-unused-vars
import {Collection, Message, Client, GuildChannel, TextChannel,
// eslint-disable-next-line no-unused-vars
  TextBasedChannel, DMChannel, Guild, GuildChannelManager} from 'discord.js';
import {FlagCommandBase} from './flag-command-base';
// eslint-disable-next-line no-unused-vars
import {OptionDefinition, CommandLineOptions} from 'command-line-args';
import {injectable, inject} from 'inversify';
import {TYPES} from '../../types';

@injectable()
/** PingFinder. */
export class EraseCommand extends FlagCommandBase {
  flagOptions: OptionDefinition[] = [
    {name: 'number', type: Number},
    {name: 'channel', type: String},
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
      throw new Error();
    }
    return numberToDelete;
  }

  /**
    * Find the channel specified, or return "console" when none.
    * Throws error to catch bad flag input.
    * @param {any} optionsChannel - Whatever came out of options.<flag name>
    * @param {Message} message - The message.
    * @return {any} - Some channel.
    */
  private parseChannel(optionsChannel:any,
      message:Message): TextChannel | DMChannel {
    const channelName:string = optionsChannel;
    // null means the command did not have the flag.
    if (channelName == null) {
      return message.channel;
    }
    if (channelName == '') {
      throw new Error('You must specify a channel when using --channel.');
    }
    const guild:Guild | null = message.guild;
    if (guild == null) {
      throw new Error('BOT ERROR: no guild on this message, somehow!');
    }
    const channels:GuildChannelManager = guild.channels;
    const cache = channels.cache;
    const channelToDeleteFrom:any = cache.find((channel)=> {
      return channel.name == channelName;
    });
    if (channelToDeleteFrom == null) {
      throw new Error('Unable to find specified channel!');
    }
    if (!(typeof channelToDeleteFrom.bulkDelete == 'function')) {
      throw new Error('BOT ERROR: channel lacks bulkDelete function?!');
    }
    return channelToDeleteFrom;
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
    const numberToDelete:number = this.parseNumber(options.number);
    const channelToDeleteFrom:TextChannel | DMChannel =
      this.parseChannel(options.channel, message);
    if (channelToDeleteFrom == null) {
      // Not found
      throw new Error();
    }
    if (!(typeof channelToDeleteFrom.bulkDelete == 'function')) {
      throw new Error();
    }

    return channelToDeleteFrom.bulkDelete(numberToDelete)
        .then((_value: Collection<string, Message>) => {
          return Promise.resolve([]);
        })
        .catch((err:any) => {
          return Promise.reject(err);
        });
  }
}
