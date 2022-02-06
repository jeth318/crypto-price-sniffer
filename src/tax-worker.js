import dotenv from 'dotenv';
dotenv.config();
import { getClosestMatch } from './db';

const mock = { symbol: 'btc', time: 1699351512 };
getClosestMatch(mock).then((result) => {
  /* eslint-disable-next-line no-console */
  console.log(result);
});
