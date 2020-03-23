import 'reflect-metadata';
import 'mocha';
import {EraseCommand} from '../../../src/services/message-commands/erase';
import {instance, mock, verify, when, anyString} from 'ts-mockito';
import {Message, Client, ClientUser, TextChannel} from 'discord.js';

describe('PingFinder', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedAuthorUserClass: ClientUser;
  let mockedAuthorUserInstance: ClientUser;
  let mockedTextChannelClass: TextChannel;
  let mockedTextChannelInstance: TextChannel;

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
    mockedTextChannelInstance = instance(mockedTextChannelClass);
    mockedMessageInstance.channel = mockedTextChannelInstance;

    eraseCommand = new EraseCommand(mockedClientInstance);
  });

  it('doCommand: for message "erase --number 3": replies "ERASE!3"',
      async () => {
        mockedMessageInstance.content = 'erase --number 3';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        verify(mockedMessageClass.reply('ERASE!3')).once();
      });


  it('doCommand: for message "erase": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'erase';
        mockedAuthorUserInstance.username = 'username';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        // TODO(M): Consider requiring exact string.
        verify(mockedMessageClass.reply(anyString())).once();
      });

  it('doCommand: for message "erase --number": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'erase --number';
        mockedAuthorUserInstance.username = 'username';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await eraseCommand.doCommand(mockedMessageInstance);

        // TODO(M): Consider requiring exact string.
        verify(mockedMessageClass.reply(anyString())).once();
      });
});
