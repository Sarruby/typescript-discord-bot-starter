// eslint-disable-next-line no-unused-vars
import {OptionDefinition} from 'command-line-args';
// eslint-disable-next-line no-unused-vars
import {Message, TextChannel, DMChannel, Guild,
// eslint-disable-next-line no-unused-vars
  GuildChannelManager} from 'discord.js';
import {FlagCommandError, FlagErrorType} from '../flag-command-error';

// OptionDefinition is a type, not a class or something...
export const channelOption:OptionDefinition = {name: 'channel', type: String};

/**
  * Find the channel specified, or return "console" when none.
  * Throws error to catch bad flag input.
  * @param {any} optionsChannel - Whatever came out of options.<flag name>
  * @param {Message} message - The message.
  * @return {any} - Some channel.
  */
export function parseChannel(optionsChannel:any,
    message:Message): TextChannel | DMChannel {
  // command-line-args: when flag not specified
  if (typeof(optionsChannel) === 'undefined') {
    return message.channel;
  }
  // command-line-args: when only "--channel" is in command
  if (typeof(optionsChannel) === 'object') {
    throw new FlagCommandError('Using --channel requires you specify ' +
    'a channel too!',
    FlagErrorType.USER_ERROR);
  }
  // If somehow a non-string is passed - should not happen; is the bot's fault.
  if (!(typeof(optionsChannel) === 'string')) {
    throw new FlagCommandError(
        'command-line-args parsed the channel flag into a non-string type!',
        FlagErrorType.BOT_ERROR);
  }
  const channelName:string = optionsChannel;
  // null means the command did not have the flag OR the flag had nothing
  // after it. We have to check if the flag was added with no input, Like
  // "erase --number 3 --channel".
  if (channelName == null) {
    if (message.content.search('--channel') >= 0) {
      throw new FlagCommandError('Using --channel requires you specify ' +
      'a channel too!',
      FlagErrorType.USER_ERROR);
    }
    return message.channel;
  }
  if (channelName == '') {
    throw new FlagCommandError('Channel not specified!',
        FlagErrorType.USER_ERROR);
  }
  const guild:Guild | null = message.guild;
  if (guild == null) {
    throw new FlagCommandError('No guild detected.', FlagErrorType.BOT_ERROR);
  }
  const channels:GuildChannelManager = guild.channels;
  const cache = channels.cache;
  const channelToDeleteFrom:any = cache.find((channel)=> {
    return channel.name == channelName;
  });
  if (channelToDeleteFrom == null) {
    throw new FlagCommandError('Channel not found!',
        FlagErrorType.USER_ERROR);
  }
  if (!(typeof channelToDeleteFrom.bulkDelete == 'function')) {
    throw new FlagCommandError('No bulkDelete function on channel!',
        FlagErrorType.BOT_ERROR);
  }
  return channelToDeleteFrom;
}
