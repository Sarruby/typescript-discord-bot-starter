// eslint-disable-next-line no-unused-vars
import {Client, Message} from 'discord.js';
// eslint-disable-next-line no-unused-vars
import {MessageHandler} from './services/message-handler';

// For integration testing.
import {inject, injectable} from 'inversify';
import {TYPES} from './types';


@injectable()
/** Bot. */
export class Bot {
  private client: Client;
  private readonly token: string;
  private messageHandler: MessageHandler;

  /**
    * Instantiate bot.
    * @param {Client} client - Discord client.
    * @param {string} token - Discord bot token from env.
    * @param {MessageHandler} messageHandler - to handle messages.
    */
  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
    @inject(TYPES.MessageHandler) messageHandler: MessageHandler,
  ) {
    this.client = client;
    this.token = token;
    this.messageHandler = messageHandler;
  }

  /**
    * Installs the listeners
    * @return {Promise <string>} - The reply from client.login().
    */
  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => {
      this.messageHandler.handle(message).catch((error: any) => {
        console.log('messageHandler unhandled message. Error: ', error);
      });
    });
    return this.client.login(this.token);
  }
}
