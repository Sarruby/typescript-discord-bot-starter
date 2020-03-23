import 'reflect-metadata';
import 'mocha';
import {helloWorldResponder} from '../../src/services/hello-world';
import {instance, mock, verify} from 'ts-mockito';
import {Message} from 'discord.js';

describe('helloWorldResponder', () => {
  let mockedMessageClass: Message;
  let mockedMessageInstance: Message;

  let responder: helloWorldResponder;

  beforeEach(() => {
    mockedMessageClass = mock(Message);
    mockedMessageInstance = instance(mockedMessageClass);
    setMessageContents();

    responder = new helloWorldResponder();
  });

  it('replies hello world', async () => {
    await responder.helloWorldEcho(mockedMessageInstance);
    verify(mockedMessageClass.reply('Hello world!')).once();
  });

  function setMessageContents() {
    mockedMessageInstance.content = 'message content';
  }
});
