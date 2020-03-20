require('dotenv').config(); // Recommended way of loading dotenv
import {Bot} from './bot'; // eslint-disable-line no-unused-vars

import container from './inversify.config';
import {TYPES} from './types';

const bot = container.get<Bot>(TYPES.Bot);
bot.listen().then(() => {
  console.log('Logged in!');
}).catch((error: any) => {
  console.log('Oh no! ', error);
});
