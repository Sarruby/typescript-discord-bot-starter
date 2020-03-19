require('dotenv').config(); // Recommended way of loading dotenv
import {Bot} from './bot';
const bot = new Bot();
bot.listen().then(() => {
  console.log('Logged in!');
}).catch((error: any) => {
  console.log('Oh no! ', error);
});
