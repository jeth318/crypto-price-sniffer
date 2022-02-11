import dotenv from 'dotenv';
import { sha256 } from 'js-sha256';
import { Spot } from '@binance/connector';
import chalk from 'chalk';
import { getChangedAssets, uploadPrices } from './db.js';
import { getAssets } from './helpers.js';

dotenv.config();
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const userSignature = sha256(apiKey + apiSecret);

const client = new Spot(apiKey, apiSecret);
const POLL_INTERVAL = 2000;

export const run = async () => {
  try {
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
  } catch (error) {
    console.log(chalk.red('ERROR:'), error);
  }
};

export default setInterval(run, POLL_INTERVAL);
