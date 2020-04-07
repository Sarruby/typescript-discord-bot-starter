import 'reflect-metadata';
import 'mocha';
import {
  parseChannel} from '../../../../src/services/message-commands/flags/channel';
import {instance, mock, when} from 'ts-mockito';
import {Message, ClientUser, TextChannel,
  // eslint-disable-next-line no-unused-vars
  Collection, Guild, GuildChannel, GuildChannelManager} from 'discord.js';
import {expect} from 'chai';

describe('ChannelFlag', () => {
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedAuthorUserClass: ClientUser;
  let mockedAuthorUserInstance: ClientUser;
  let mockedTextChannelClass: TextChannel;
  let mockedTextChannelInstance: TextChannel;
  let mockedGuildClass: Guild;
  let mockedGuildInstance: Guild;
  let mockedGuildChannelManagerClass: GuildChannelManager;
  let mockedGuildChannelManagerInstance: GuildChannelManager;
  const guildChannelCollection = new Collection<string, GuildChannel>();
  let mockedGuildChannelInstance: TextChannel;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedAuthorUserClass = mock(ClientUser);
    mockedAuthorUserInstance = instance(mockedAuthorUserClass);
    mockedAuthorUserInstance.id = '111';
    mockedMessageInstance.author = mockedAuthorUserInstance;
    mockedTextChannelClass = mock(TextChannel);
    when(mockedTextChannelClass.bulkDelete(3))
        .thenResolve(new Collection<string, Message>());
    mockedTextChannelInstance = instance(mockedTextChannelClass);
    mockedMessageInstance.channel = mockedTextChannelInstance;

    mockedGuildClass = mock(Guild);
    mockedGuildInstance = instance(mockedGuildClass);
    // .guild is a read only property, necessitating this syntax.
    when(mockedMessageClass.guild).thenReturn(mockedGuildInstance);
    mockedGuildChannelManagerClass = mock(GuildChannelManager);
    mockedGuildChannelManagerInstance =
    instance(mockedGuildChannelManagerClass);
    mockedGuildInstance.channels = mockedGuildChannelManagerInstance;
    mockedGuildChannelInstance = instance(mockedTextChannelClass);
    mockedGuildChannelInstance.name = 'desired-channel';
    guildChannelCollection.set('desired-channel', mockedGuildChannelInstance);
    mockedGuildChannelManagerInstance.cache = guildChannelCollection;
  });


  describe('Correct Usage', () => {
    it('--channel desired-channel => gets channel',
        () => {
          const optionsChannel:string = 'desired-channel';

          const returnedChannel:any = parseChannel(
              optionsChannel, mockedMessageInstance);

          expect(returnedChannel).to.equal(mockedGuildChannelInstance);
        });

    it('<not specified> => gets message\'s channel',
        () => {
          // simulate no flag with undefined
          const returnedChannel:any = parseChannel(
              undefined, mockedMessageInstance);

          expect(returnedChannel).to.equal(mockedGuildChannelInstance);
        });
  });

  describe('Bad Usage', () => {
    it('--channel (nothing specified) => user error',
        () => {
          expect(() => parseChannel(
              null, mockedMessageInstance)).to.throw(
              'Using --channel requires you specify a channel too!');
        });
    it('--channel 3 (wrong type) => bot error',
        () => {
          const optionsChannel:Number = 3;

          expect(() => parseChannel(
              optionsChannel, mockedMessageInstance)).to.throw(
              'command-line-args parsed the channel flag ' +
              'into a non-string type!');
        });

    it('--channel nonexistent => user error',
        () => {
          const optionsChannel:string = 'nonexistent';

          expect(() => parseChannel(
              optionsChannel, mockedMessageInstance)).to.throw(
              'Channel not found!',
          );
        });
  });
});
