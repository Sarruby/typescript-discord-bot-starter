import "reflect-metadata";
import 'mocha';
import {expect} from 'chai';
import {PingCommand} from "../../../src/services/message-commands/ping";
import {MessageHandler} from "../../../src/services/message-handler";
import {instance, mock, verify, when} from "ts-mockito";
import {Message} from "discord.js";

describe('PingFinder', () => {
let mockedMessageClass: Message;
let mockedMessageInstance: Message;

  let pingCommand: PingCommand;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);

    pingCommand = new PingCommand();
  })

  it('isCommandCalled: finds "ping" in string', () => {
    mockedMessageInstance.content = "some ping string";

    when(mockedMessageClass.reply(mockedMessageInstance))
      .thenResolve(mockedMessageInstance);

    expect(pingCommand.isCommandCalled(mockedMessageInstance)).to.be.true
  })

  it('doCommand: replies "Pong!"', async () => {
    when(mockedMessageClass.reply(mockedMessageInstance))
      .thenResolve(mockedMessageInstance);

    await pingCommand.doCommand(mockedMessageInstance);

        verify(mockedMessageClass.reply('Pong!')).once();
  })
});
