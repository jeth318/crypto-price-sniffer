require('dotenv').config();
const { isUniqueSignature, updatePrices } = require('./db');
const { getAssets } = require('./helpers');
const { sha256 } = require('js-sha256');
const { Spot } = require('@binance/connector');
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const client = new Spot(apiKey, apiSecret);
const POLL_INTERVAL = 60000;

setInterval(async () => {
  const { data } = await client.account();
  const assets = getAssets(data);
  const signature = sha256(JSON.stringify(assets));
  const updatedAssets = await isUniqueSignature(signature, assets);
  if (updatedAssets.length) {
    updatePrices(updatedAssets);
  }
}, POLL_INTERVAL);
