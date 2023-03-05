import { sha256 } from 'js-sha256';
import { Spot } from '@binance/connector';
import { getChangedAssets, uploadPrices } from './db';
import {
  getAssets,
  printErrorMessage,
  errorLogger,
  printMissingEnvMessage,
} from './helpers';

const key = process.env.BINANCE_API_KEY || "";
const secret = process.env.BINANCE_API_SECRET || "";
const pollInterval = parseFloat(process.env.POLL_INTERVAL || "60000");

export const run = async () => {
  try {
    console.log("RUN");
    const userSignature = sha256(key + secret);
    const client = new Spot(key, secret);
    const { data } = await client.account();
    const assets = getAssets(data);
    const walletSignature = sha256(JSON.stringify(assets));
    const changedAssets = await getChangedAssets(
      userSignature,
      walletSignature,
      assets
    );
    console.log(changedAssets);
    
    if (changedAssets.length) {
      uploadPrices(changedAssets);
    }
  } catch (error) {
    errorLogger(error);
    printErrorMessage(error);
  }
};

export default (() => {
  if (key && secret) {
    setInterval(run, pollInterval);
  } else {
    printMissingEnvMessage();
  }
})();
