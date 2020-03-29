import 'reflect-metadata';
import 'mocha';
import {EraseCommand} from '../../../src/services/message-commands/erase';
import {instance, mock, verify, when, anyString, anything,
  capture} from 'ts-mockito';
import {Message, Client, ClientUser, TextChannel,
  // eslint-disable-next-line no-unused-vars
  Collection, Guild, GuildChannel, GuildChannelManager} from 'discord.js';
import {expect} from 'chai';

describe('EraseCommand', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
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

  let eraseCommand: EraseCommand;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedClientClass = mock(Client);
    mockedClientInstance = instance(mockedClientClass);
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
    mockedGuildChannelInstance.name = 'general';
    guildChannelCollection.set('general', mockedGuildChannelInstance);
    mockedGuildChannelManagerInstance.cache = guildChannelCollection;

    eraseCommand = new EraseCommand(mockedClientInstance);
  });

  it('doCommand: for message "erase --number 3": erases 3',
      async () => {
        mockedMessageInstance.content = 'erase --number 3';

        when(mockedTextChannelClass.bulkDelete(anything()))
            .thenResolve(new Collection<string, Message>());

        await eraseCommand.doCommand(mockedMessageInstance);

        verify(mockedTextChannelClass.bulkDelete(3)).once();
      });

  it('doCommand: for message "erase --number tree": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'erase --number tree';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        // TODO(M): Consider requiring exact string.
        verify(mockedMessageClass.reply(anyString())).once();

        verify(mockedTextChannelClass.bulkDelete(anything())).never();

        const [replyMessage] = capture(mockedMessageClass.reply).last();
        expect(replyMessage).to.contain('--number is not a number');
      });


  it('doCommand: for message "erase": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'erase';
        mockedAuthorUserInstance.username = 'username';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        verify(mockedMessageClass.reply(anyString())).once();
        const [replyMessage] = capture(mockedMessageClass.reply).last();
        expect(replyMessage).to.contain('Number to delete is required');
      });

  it('doCommand: for message "erase --number": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'erase --number';
        mockedAuthorUserInstance.username = 'username';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        verify(mockedMessageClass.reply(anyString())).once();
        const [replyMessage] = capture(mockedMessageClass.reply).last();
        expect(replyMessage).to.contain('Number to delete is required');
      });


  it('doCommand: for message "erase --number 3 --channel general":' +
  'erases 3 from general',
  async () => {
    mockedMessageInstance.content = 'erase --number 3 --channel general';

    await eraseCommand.doCommand(mockedMessageInstance)
        .then((_message:Message | Message[]) => {
          expect.fail(); // Expecting a failure!
        }).catch((error:any) => {
          expect(error).is.not.null;
          expect(error instanceof Error).is.true;
        });

    verify(mockedTextChannelClass.bulkDelete(3)).once();
  });

  it('doCommand: for message "erase --number 3 --channel none":' +
  'replies with parse error',
  async () => {
    mockedMessageInstance.content = 'erase --number 3 --channel none';

    when(mockedMessageClass.reply(mockedMessageInstance))
        .thenResolve(mockedMessageInstance);

    await eraseCommand.doCommand(mockedMessageInstance);

    verify(mockedMessageClass.reply(anyString())).once();
    const [replyMessage] = capture(mockedMessageClass.reply).last();
    expect(replyMessage).to.contain('Channel not found');
    verify(mockedTextChannelClass.bulkDelete(anything())).never();
  });

  it('doCommand: for message "erase --number 3 --channel": ' +
  'replies with parse error',
  async () => {
    mockedMessageInstance.content = 'erase --number 3 --channel';

    when(mockedMessageClass.reply(mockedMessageInstance))
        .thenResolve(mockedMessageInstance);

    await eraseCommand.doCommand(mockedMessageInstance);

    verify(mockedMessageClass.reply(anyString())).once();
    const [replyMessage] = capture(mockedMessageClass.reply).last();
    expect(replyMessage).to.contain('--channel requires you specify a channel');
  });
});
