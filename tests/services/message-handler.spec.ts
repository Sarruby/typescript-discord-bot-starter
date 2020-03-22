import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from "../../src/services/message-commands/ping";
import {MessageHandler} from "../../src/services/message-handler";
import {instance, mock, verify, when} from "ts-mockito";
import {Message, Client, User} from "discord.js";

describe('MessageHandler', () => {
  let mockedClientClass: Client;
  let mockedClientInstance: Client;
  let mockedPingCommandClass: PingCommand;
  let mockedPingCommandInstance: PingCommand;
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;
  let mockedAuthorUserClass: User;
  let mockedAuthorUserInstance: User;

  let service: MessageHandler;

  beforeEach(() => {
    mockedClientClass = mock(Client);
    mockedClientInstance = instance(mockedClientClass);
    mockedPingCommandClass = mock(PingCommand);
    mockedPingCommandInstance = instance(mockedPingCommandClass);
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    mockedAuthorUserClass = mock(User);
    mockedAuthorUserInstance = instance(mockedAuthorUserClass);
    mockedMessageInstance.author = mockedAuthorUserInstance;

    service = new MessageHandler(mockedClientInstance, mockedPingCommandInstance);
  })

  it('should reply', async () => {
    makeValidMessage();
    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
      .thenReturn(true);

    await service.handle(mockedMessageInstance);

    verify(mockedPingCommandClass.doCommand(mockedMessageInstance)).once();
  })

  it('should not reply to bot', async () => {
    mockedAuthorUserInstance.bot = true;
    mockedMessageClass.author = mockedAuthorUserInstance;
    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
      .thenReturn(true);

    await service.handle(mockedMessageInstance).then(() => {
      // Successful promise is unexpected, so we fail the test
      expect.fail('Unexpected promise');
    }).catch(() => {
    // Rejected promise is expected, so nothing happens here
    });

    verify(mockedPingCommandClass.doCommand(mockedMessageInstance)).never();
  })

  it('should not activate command when isCommandCalled is false', async () => {
    when(mockedPingCommandClass.isCommandCalled(mockedMessageInstance))
      .thenReturn(false);

    await service.handle(mockedMessageInstance).then(() => {
      // Successful promise is unexpected, so we fail the test
      expect.fail('Unexpected promise');
    }).catch(() => {
	 // Rejected promise is expected, so nothing happens here
    });

    verify(mockedPingCommandClass.doCommand(mockedMessageInstance)).never();
  })

  function makeValidMessage() {
    mockedAuthorUserInstance.bot = false;
  }
});
