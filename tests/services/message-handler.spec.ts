import 'reflect-metadata';
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from '../../src/services/message-commands/ping';
import {MessageHandler} from '../../src/services/message-handler';
import {instance, mock, verify, when, anything, anyString} from 'ts-mockito';

// eslint-disable-next-line no-unused-vars
import {Message, Client, ClientUser, TextChannel, DMChannel, MessageMentions,
// eslint-disable-next-line no-unused-vars
  User, Collection} from 'discord.js';

describe('MessageHandler', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
  let mockedClientUserClass: ClientUser;
  let mockedClientUserInstance: ClientUser;

  let mockedPingCommandClass: PingCommand;
  let mockedPingCommandInstance: PingCommand;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  const kOriginalMessage = 'original message';
  let mockedAuthorUserClass: ClientUser;
  let mockedAuthorUserInstance: ClientUser;
  let mockedTextChannelClass: TextChannel;
  let mockedTextChannelInstance: TextChannel;
  let mockedDMChannelClass: DMChannel;
  let mockedDMChannelInstance: DMChannel;
  let mockedMessageMentionsClass: MessageMentions;
  let mockedMessageMentionsInstance: MessageMentions;
  const mentionedUsers:Collection<string, User> =
    new Collection<string, User>();

  let messageHandler: MessageHandler;

  beforeEach(() => {
    mockedClientClass = mock(Client);
    mockedClientInstance = instance(mockedClientClass);
    mockedClientUserClass = mock(ClientUser);
    mockedClientUserInstance = instance(mockedClientUserClass);

    mockedPingCommandClass = mock(PingCommand);
    mockedPingCommandInstance = instance(mockedPingCommandClass);

    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedAuthorUserClass = mock(ClientUser);
    mockedAuthorUserInstance = instance(mockedAuthorUserClass);
    mockedMessageInstance.author = mockedAuthorUserInstance;
    mockedTextChannelClass = mock(TextChannel);
    mockedTextChannelInstance = instance(mockedTextChannelClass);
    mockedTextChannelInstance.type = 'text';
    mockedDMChannelClass = mock(DMChannel);
    mockedDMChannelInstance = instance(mockedDMChannelClass);
    mockedDMChannelInstance.type = 'dm';
    mockedMessageMentionsClass = mock(MessageMentions);
    mockedMessageMentionsInstance = instance(mockedMessageMentionsClass);

    // Conditions of a valid message. Override to break.
    mockedMessageInstance.content = kOriginalMessage;
    mockedAuthorUserInstance.bot = false;
    mockedClientInstance.user = mockedClientUserInstance; // can't be null
    mockedMessageInstance.channel = mockedTextChannelInstance;
    mockedTextChannelInstance.name = 'console';
    mockedMessageInstance.mentions = mockedMessageMentionsInstance;
    mockedMessageMentionsInstance.users = mentionedUsers;

    messageHandler = new MessageHandler(
        mockedClientInstance, mockedPingCommandInstance);
  });

  it('for valid message: calls doCommand', async () => {
    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
        .thenReturn(true);

    await messageHandler.handle(mockedMessageInstance);

    verify(mockedPingCommandClass.doCommand(mockedMessageInstance)).once();
  });

  it('for message by bot: ignores', async () => {
    mockedAuthorUserInstance.bot = false;

    await messageHandler.handle(mockedMessageInstance);

    verify(mockedMessageClass.reply()).never();
  });

  it('for broken client: error', async () => {
    mockedClientInstance.user = null;

    await messageHandler.handle(mockedMessageInstance)
        .then((_message:Message | Message[]) => {
          expect.fail(); // Expecting a failure!
        }).catch((error:any) => {
          expect(error).is.not.null;
          expect(error instanceof Error).is.true;
        });

    verify(mockedMessageClass.reply()).never();
  });

  it('for dm message: replies with error message', async () => {
    mockedMessageInstance.channel = mockedDMChannelInstance;

    await messageHandler.handle(mockedMessageInstance);

    // TODO(M): Consider making strictEquals or (somehow) match regex.
    verify(mockedMessageClass.reply(anyString())).once();
  });

  it('for message mentioning @bot not in console: replies with error message',
      async () => {
        mockedTextChannelInstance.name = 'not-console';
        mockedClientUserInstance.id = 'testClientUserId';
        const mentionedUsersIncludesBot = new Collection<string, User>();
        mentionedUsersIncludesBot.set(
            'testClientUserId', mockedClientUserInstance);
        mockedMessageMentionsInstance.users = mentionedUsersIncludesBot;

        await messageHandler.handle(mockedMessageInstance);

        // TODO(M): Consider making strictEquals or (somehow) match regex.
        verify(mockedMessageClass.reply(anyString())).once();
      });

  it('for message not in console: ignores', async () => {
    mockedTextChannelInstance.name = 'not-console';

    await messageHandler.handle(mockedMessageInstance);

    verify(mockedPingCommandClass.isCommandCalled(anything())).never();
  });

  it('for message mentioning @bot in console: replies with error message',
      async () => {
        mockedClientUserInstance.id = 'testClientUserId';
        const mentionedUsersIncludesBot = new Collection<string, User>();
        mentionedUsersIncludesBot.set(
            'testClientUserId', mockedClientUserInstance);
        mockedMessageMentionsInstance.users = mentionedUsersIncludesBot;

        await messageHandler.handle(mockedMessageInstance);

        // TODO(M): Consider making strictEquals or (somehow) match regex.
        verify(mockedMessageClass.reply(anyString())).once();
      });

  it('for message with no command otherwise valid: replies with error message',
      async () => {
        when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
            .thenReturn(false);

        await messageHandler.handle(mockedMessageInstance);

        // TODO(M): Consider making strictEquals or (somehow) match regex.
        verify(mockedMessageClass.reply(anyString())).once();
      });
});
