// For integration testing.

import 'reflect-metadata';
import {Container} from 'inversify';
import {TYPES} from './types';
import {Bot} from './bot';
import {Client} from 'discord.js';

const container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string | undefined>(TYPES.Token).toConstantValue(
    process.env.TOKEN);

export default container;
