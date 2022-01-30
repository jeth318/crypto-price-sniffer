require('dotenv').config();
const { sha256 } = require('js-sha256');
const { Spot } = require('@binance/connector');
const { getChangedAssets, uploadPrices } = require('./db');
const { getAssets } = require('./helpers');

const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const userSignature = sha256(apiKey + apiSecret);
const client = new Spot(apiKey, apiSecret);
const POLL_INTERVAL = 6000;

setInterval(async () => {
  const { data } = await client.account();
  const assets = getAssets(data);
  const walletSignature = sha256(JSON.stringify(assets));
  const changedAssets = await getChangedAssets(
    userSignature,
    walletSignature,
    assets
  );
  if (changedAssets.length) {
    uploadPrices(changedAssets);
  }
}, POLL_INTERVAL);
