import dotenv from 'dotenv';
dotenv.config();
import { sha256 } from 'js-sha256';
import { Spot } from '@binance/connector';
import { getChangedAssets, uploadPrices } from './db.js';
import { getAssets } from './helpers.js';
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const userSignature = sha256(apiKey + apiSecret);

const client = new Spot(apiKey, apiSecret);
const POLL_INTERVAL = 60000;

export const run = async () => {
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
};
setInterval(run, 2000);
