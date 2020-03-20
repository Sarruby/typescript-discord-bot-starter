// For integration testing.

import 'reflect-metadata';
import {Container} from 'inversify';
import {TYPES} from './types';

import {Client} from 'discord.js';

import {Bot} from './bot';
import {MessageHandler} from './services/message-handler';
import {PingCommand} from './services/message-commands/ping';

const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string | undefined>(TYPES.Token).toConstantValue(
    process.env.TOKEN);

container.bind<MessageHandler>(TYPES.MessageHandler).to(MessageHandler)
    .inSingletonScope();
container.bind<PingCommand>(TYPES.PingCommand).to(PingCommand)
    .inSingletonScope();

export default container;
