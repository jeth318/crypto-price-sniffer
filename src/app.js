import dotenv from 'dotenv';
import { sha256 } from 'js-sha256';
import { Spot } from '@binance/connector';
import { getChangedAssets, uploadPrices } from './db.js';
import {
  getAssets,
  printErrorMessage,
  errorLogger,
  printMissingEnvMessage,
} from './helpers.js';

dotenv.config();
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
const pollInterval = process.env.POLL_INTERVAL || 60000;

export const run = async () => {
  try {
    const userSignature = sha256(apiKey + apiSecret);
    const client = new Spot(apiKey, apiSecret);
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
    errorLogger(error);
    printErrorMessage(error);
  }
};

export default (() => {
  if (apiKey && apiSecret) {
    setInterval(run, pollInterval);
  } else {
    printMissingEnvMessage();
  }
})();
