require('dotenv').config();
const { getClosestMatch } = require('./db');

const mock = { symbol: 'btc', time: 1699351512 };
getClosestMatch(mock).then((result) => {
  /* eslint-disable-next-line no-console */
  console.log(result);
});
