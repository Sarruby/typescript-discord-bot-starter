import 'reflect-metadata';
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from '../../../src/services/message-commands/ping';
import {instance, mock, verify, when, anything, anyString} from 'ts-mockito';
import {Message, Client, ClientUser, TextChannel} from 'discord.js';
import {CommandDetection}
  from '../../../src/services/message-commands/flag-command-base';

describe('PingFinder', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedAuthorUserClass: ClientUser;
  let mockedAuthorUserInstance: ClientUser;
  let mockedTextChannelClass: TextChannel;
  let mockedTextChannelInstance: TextChannel;

  let pingCommand: PingCommand;

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

    pingCommand = new PingCommand(mockedClientInstance);
  });

  it('isCommandCalled: finds "ping" in string', () => {
    mockedMessageInstance.content = 'some ping string';

    expect(pingCommand.isCommandCalled(mockedMessageInstance))
        .equal(CommandDetection.COMMAND_CALLED);
  });

  it('doCommand: for message "ping": replies "Pong!"', async () => {
    mockedMessageInstance.content = 'ping';

    when(mockedMessageClass.reply(mockedMessageInstance))
        .thenResolve(mockedMessageInstance);

    await pingCommand.doCommand(mockedMessageInstance);

    verify(mockedMessageClass.reply('Pong!')).once();
  });

  it('doCommand: for message "ping --user <@!333>": replies "<@!333> Pong!"',
      async () => {
        mockedMessageInstance.content = 'ping --user <@!333>';

        when(mockedTextChannelClass.send(anything()))
            .thenResolve();

        await pingCommand.doCommand(mockedMessageInstance);

        verify(mockedTextChannelClass
            .send('<@!333>, ping! From <@!111>')).once();
      });


  it('doCommand: for message "ping --badflag": replies with parse error',
      async () => {
        mockedMessageInstance.content = 'ping --badflag';
        mockedAuthorUserInstance.username = 'username';

        when(mockedMessageClass.reply(mockedMessageInstance))
            .thenResolve(mockedMessageInstance);

        await pingCommand.doCommand(mockedMessageInstance);

        // TODO(M): Consider requiring exact string.
        verify(mockedMessageClass.reply(anyString())).once();
      });
});
