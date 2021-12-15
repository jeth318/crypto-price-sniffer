require('dotenv').config();
const { getClosestMatch } = require('./db');


const mock = { symbol: 'btc', time: 1699351512 };
getClosestMatch(mock).then(result => {
  console.log(result);
})

