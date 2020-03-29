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


  describe('Correct Usage + Successful API calls', () => {
    beforeEach(() => {
      when(mockedTextChannelClass.bulkDelete(anything()))
          .thenResolve(new Collection<string, Message>());
    });

    afterEach(() => {
      // Both the current channel and the guild channel are of this class,
      // so this check checks both channels are never called.
      verify(mockedTextChannelClass.bulkDelete(anything())).once();
      verify(mockedMessageClass.reply(anyString())).never();
    });

    it('"erase --number 3" => erases 3',
        async () => {
          mockedMessageInstance.content = 'erase --number 3';

          await eraseCommand.doCommand(mockedMessageInstance);

          verify(mockedTextChannelClass.bulkDelete(3)).once();
        });


    it('"erase --number 3 --channel general" => erases 3 from general',
        async () => {
          mockedMessageInstance.content = 'erase --number 3 --channel general';

          await eraseCommand.doCommand(mockedMessageInstance);

          // TODO(M): Consider verifying this was the guild instance, not just
          // the class function.
          verify(mockedTextChannelClass.bulkDelete(3)).once();
        });
  });

  describe('Incorrect Usage + Successful API calls', () => {
    beforeEach(() => {
      when(mockedMessageClass.reply(mockedMessageInstance))
          .thenResolve(mockedMessageInstance);
    });

    afterEach(() => {
      verify(mockedMessageClass.reply(anyString())).once();
      // Both the current channel and the guild channel are of this class,
      // so this check checks both channels are never called.
      verify(mockedTextChannelClass.bulkDelete(anything())).never();
    });

    it('"erase --number tree" => error NaN',
        async () => {
          mockedMessageInstance.content = 'erase --number tree';

          await eraseCommand.doCommand(mockedMessageInstance);

          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('--number is not a number');
        });

    it('"erase" => error requires --number',
        async () => {
          mockedMessageInstance.content = 'erase';
          mockedAuthorUserInstance.username = 'username';

          await eraseCommand.doCommand(mockedMessageInstance);

          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('Number to delete is required');
        });

    it('"erase --number" => error requires --number',
        async () => {
          mockedMessageInstance.content = 'erase --number';

          await eraseCommand.doCommand(mockedMessageInstance);

          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('Number to delete is required');
        });


    it('"erase --number 3 --channel none" => error not found',
        async () => {
          mockedMessageInstance.content = 'erase --number 3 --channel none';

          await eraseCommand.doCommand(mockedMessageInstance);

          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('Channel not found');
        });

    it('"erase --number 3 --channel" => error not specified',
        async () => {
          mockedMessageInstance.content = 'erase --number 3 --channel';

          await eraseCommand.doCommand(mockedMessageInstance);

          const [replyMessage] = capture(mockedMessageClass.reply).last();
          expect(replyMessage).to.contain('--channel requires you specify');
        });
  });


    describe('Unsuccessful API calls', () => {
      it('"erase --number 3" + bulkDelete error => Promise rejects with ' +
      'error message',
          async () => {
            mockedAuthorUserInstance.username = 'username';
            when(mockedTextChannelClass.bulkDelete(anything()))
                .thenReject(new Error('Simulated Discord API Error'));

            mockedMessageInstance.content = 'erase --number 3';

            await eraseCommand.doCommand(mockedMessageInstance)
            .catch((error:Error) => {
              expect(error.message).contains('Simulated Discord API Error');
            });

            verify(mockedTextChannelClass.bulkDelete(3)).once();
            verify(mockedMessageClass.reply(anyString())).never();
          });

      it('"erase --number tree" + reply error => Promise rejects with ' +
      'error message',
          async () => {
            mockedAuthorUserInstance.username = 'username';
            when(mockedMessageClass.reply(anything()))
                .thenReject(new Error('Simulated Discord API Error'));

            mockedMessageInstance.content = 'erase --number tree';

            await eraseCommand.doCommand(mockedMessageInstance)
            .catch((error:Error) => {
              expect(error.message).contains('Simulated Discord API Error');
            });

            verify(mockedTextChannelClass.bulkDelete(anything())).never();
            verify(mockedMessageClass.reply(anyString())).once();
          });
    });
});
