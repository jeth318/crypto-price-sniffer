require('dotenv').config();
const { getChangedAssets, updatePrices, getClosestMatch } = require('./db');
const { getAssets } = require('./helpers');
const { sha256 } = require('js-sha256');
const { Spot } = require('@binance/connector');
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const userSignature = sha256(apiKey+apiSecret);
const client = new Spot(apiKey, apiSecret);
const POLL_INTERVAL = 6000;

/*const mock = { symbol: 'btc', time: 1699351512 };
getClosestMatch(mock).then(result => {
  console.log(result);
})*/

setInterval(async () => {
  const { data } = await client.account();
  const assets = getAssets(data);
  const walletSignature = sha256(JSON.stringify(assets));
  const changedAssets = await getChangedAssets(userSignature, walletSignature, assets);
  if (changedAssets.length) {
    updatePrices(changedAssets);
  }
}, POLL_INTERVAL);
