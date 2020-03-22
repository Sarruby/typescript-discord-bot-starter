import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from "../../src/services/message-commands/ping";
import {MessageHandler} from "../../src/services/message-handler";
import {instance, mock, verify, when, anything, anyString} from "ts-mockito";
import {Message, Client, ClientUser, TextChannel, DMChannel, MessageMentions, User, Collection} from "discord.js";

describe('MessageHandler', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
  let mockedClientUserClass: ClientUser;
  let mockedClientUserInstance: ClientUser;

  let mockedPingCommandClass: PingCommand;
  let mockedPingCommandInstance: PingCommand;

  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let kOriginalMessage = 'original message';
  let mockedAuthorUserClass: ClientUser;
  let mockedAuthorUserInstance: ClientUser;
  let mockedTextChannelClass: TextChannel;
  let mockedTextChannelInstance: TextChannel;
  let mockedDMChannelClass: DMChannel;
  let mockedDMChannelInstance: DMChannel;
  let mockedMessageMentionsClass: MessageMentions;
  let mockedMessageMentionsInstance: MessageMentions;
  let mentionedUsers:Collection<string, User> = new Collection<string, User>();

  let service: MessageHandler;

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

    service = new MessageHandler(mockedClientInstance, mockedPingCommandInstance);
  })

  function makeValidMessage() {
    mockedMessageInstance.content = kOriginalMessage;
    mockedAuthorUserInstance.bot = false;
    mockedClientInstance.user = mockedClientUserInstance; // can't be null
    mockedMessageInstance.channel = mockedTextChannelInstance;
    mockedTextChannelInstance.name = 'console';
    mockedMessageInstance.mentions = mockedMessageMentionsInstance;
    mockedMessageMentionsInstance.users = mentionedUsers;
  }

  it('for valid message: calls doCommand', async () => {
    makeValidMessage();

    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
      .thenReturn(true);

    await service.handle(mockedMessageInstance);

    verify(mockedPingCommandClass.doCommand(mockedMessageInstance)).once();
  })

  it('for message by bot: ignores', async () => {
    makeValidMessage();
    mockedAuthorUserInstance.bot = false;

    await service.handle(mockedMessageInstance);

    verify(mockedMessageClass.reply()).never();
  })

  it('for broken client: error', async () => {
    makeValidMessage();
    mockedClientInstance.user = null;

    await service.handle(mockedMessageInstance).then((_message:Message | Message[]) => {
      expect.fail(); // Expecting a failure!
    }).catch((error:any) => {
      expect(error).is.not.null;
      expect(error instanceof Error).is.true;
    });

    verify(mockedMessageClass.reply()).never();
  })

  it('for dm message: replies with error message', async () => {
    makeValidMessage();
    mockedMessageInstance.channel = mockedDMChannelInstance;

    await service.handle(mockedMessageInstance);

    // TODO(M): Consider making strictEquals or figuring out how to match regex.
    verify(mockedMessageClass.reply(anyString())).once();
  })

  it('for message mentioning @bot not in console: replies with error message', async () => {
    makeValidMessage();
    mockedTextChannelInstance.name = 'not-console';
    mockedClientUserInstance.id = 'testClientUserId';
    let mentionedUsersIncludesBot = new Collection<string, User>();
    mentionedUsersIncludesBot.set('testClientUserId', mockedClientUserInstance);
    mockedMessageMentionsInstance.users = mentionedUsersIncludesBot;

    await service.handle(mockedMessageInstance);

    // TODO(M): Consider making strictEquals or figuring out how to match regex.
    verify(mockedMessageClass.reply(anyString())).once();
  })

  it('for message not in console: ignores', async () => {
    makeValidMessage();
    mockedTextChannelInstance.name = 'not-console';

    await service.handle(mockedMessageInstance);

    verify(mockedPingCommandClass.isCommandCalled(anything())).never();
})

  it('for message mentioning @bot in console: replies with error message', async () => {
    makeValidMessage();
    mockedClientUserInstance.id = 'testClientUserId';
    let mentionedUsersIncludesBot = new Collection<string, User>();
    mentionedUsersIncludesBot.set('testClientUserId', mockedClientUserInstance);
    mockedMessageMentionsInstance.users = mentionedUsersIncludesBot;

    await service.handle(mockedMessageInstance);

    // TODO(M): Consider making strictEquals or figuring out how to match regex.
    verify(mockedMessageClass.reply(anyString())).once();
  })

  it('for message with no command otherwise valid: replies with error message', async () => {
    makeValidMessage();
    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
      .thenReturn(false);

    await service.handle(mockedMessageInstance);

    // TODO(M): Consider making strictEquals or figuring out how to match regex.
    verify(mockedMessageClass.reply(anyString())).once();
  })
});
