// eslint-disable-next-line no-unused-vars
import {Client, Message} from 'discord.js';

// For integration testing.
import {inject, injectable} from 'inversify';
import {TYPES} from './types';

/** Bot. */
@injectable()
export class Bot {
  private client: Client;
  private readonly token: string;

  /**
    * Instantiate bot.
    * @param {Client} client - Discord client.
    * @param {string} token - Discord bot token from env.
    */
  constructor(
    @inject(TYPES.Client) client: Client,
    @inject(TYPES.Token) token: string,
  ) {
    this.client = client;
    this.token = token;
  }

  /**
    * Installs the listeners
    * @return {Promise < Message | Message[] >} - The replied message.
    */
  public listen(): Promise<string> {
    this.client.on('message', (message: Message) => {
      console.log(message.content);
    });
    return this.client.login(this.token);
  }
}
