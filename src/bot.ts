// eslint-disable-next-line no-unused-vars
import {Client, Message} from 'discord.js';

/** Bot. */
export class Bot {
  /**
    * Installs the listeners
    * @return {Promise < Message | Message[] >} - The replied message.
    */
  public listen(): Promise<string> {
    const client = new Client();
    client.on('message', (message: Message) => {
      console.log(message.content);
    });
    return client.login(process.env.TOKEN);
  }
}
