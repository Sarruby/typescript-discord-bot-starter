import 'reflect-metadata';
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from '../../../src/services/message-commands/ping';
import {instance, mock, verify, when, anything, anyString,
  capture} from 'ts-mockito';
import {Message, Client, ClientUser, TextChannel} from 'discord.js';
import {CommandDetection}
  from '../../../src/services/message-commands/flag-command-base';

describe('PingCommand', () => {
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

  describe('Correct Usage + Successful API calls', () => {
    it('"ping" => replies "Pong!"', async () => {
      mockedMessageInstance.content = 'ping';

      when(mockedMessageClass.reply(mockedMessageInstance))
          .thenResolve(mockedMessageInstance);

      await pingCommand.doCommand(mockedMessageInstance);

      verify(mockedMessageClass.reply('Pong!')).once();
    });

    it('"ping --user <@!333>" => replies "<@!333> Pong!"',
        async () => {
          mockedMessageInstance.content = 'ping --user <@!333>';

          when(mockedTextChannelClass.send(anything()))
              .thenResolve();

          await pingCommand.doCommand(mockedMessageInstance);

          verify(mockedTextChannelClass
              .send('<@!333>, ping! From <@!111>')).once();
        });
  });
  describe('Incorrect Usage + Successful API calls', () => {
    it('"ping --badflag" => error parsing',
        async () => {
          mockedMessageInstance.content = 'ping --badflag';
          mockedAuthorUserInstance.username = 'username';

          when(mockedMessageClass.reply(mockedMessageInstance))
              .thenResolve(mockedMessageInstance);

          await pingCommand.doCommand(mockedMessageInstance);

          // TODO(M): Consider requiring exact string.
          verify(mockedMessageClass.reply(anyString())).once();
          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('Unable to parse');
        });


    it('"ping a lot of words to parse" => error parsing',
        async () => {
          mockedMessageInstance.content = 'ping a lot of words to parse';
          mockedAuthorUserInstance.username = 'username';

          when(mockedMessageClass.reply(mockedMessageInstance))
              .thenResolve(mockedMessageInstance);

          await pingCommand.doCommand(mockedMessageInstance);

          // TODO(M): Consider requiring exact string.
          verify(mockedMessageClass.reply(anyString())).once();
          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('Unable to parse');
        });
  });
});
