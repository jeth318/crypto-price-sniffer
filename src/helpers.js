import cs from 'crypto-symbol';
import axios from 'axios';
import coinList from '../complete-coinlist.json';
import * as helpers from './helpers.js';
import * as messages from './messages.en.js';

const { nameLookup } = cs.cryptoSymbol({});

export const printInfoMessage = (userSignature) => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getNewWalletSignatureMessage(userSignature));
};

export const printMissingCoinsMessage = (symbols) => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getMissingCoinsMessage(symbols));
};

export const getAssets = (data) =>
  data.balances.filter(
    ({ free, locked }) => parseFloat(free) > 0 || parseFloat(locked) > 0
  );

export const getGeckoSymbolFromGeckoId = (geckoId) => {
  const match = coinList.find(
    ({ id }) => id.toLocaleUpperCase() === geckoId.toUpperCase()
  );
  return match ? match.symbol : null;
};

export const getGeckoIdFromSymbol = (symbol) => {
  const matches = coinList.filter(
    (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return matches.length ? matches[0].id : null;
};

export const getCoinNames = (assets) =>
  assets.map(({ asset }) => {
    return {
      name: nameLookup(asset),
      symbol: asset,
      geckoId: helpers.getGeckoIdFromSymbol(asset),
    };
  });

export const getGeckoIdsFromAssets = (assets) =>
  helpers
    .getCoinNames(assets)
    .map(({ geckoId }) => geckoId)
    .filter((id) => !!id);

export const getPriceData = async (ids) => {
  const encodedIds = encodeURIComponent(ids.toString());
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodedIds}&vs_currencies=sek%2Cusd&include_last_updated_at=true`;

  try {
    const { data } = await axios.get(url);
    return Object.keys(data).map((key) => ({
      id: key,
      symbol: helpers.getGeckoSymbolFromGeckoId(key),
      last_updated_at: data[key].last_updated_at,
      sek: data[key].sek,
      usd: data[key].usd,
      date: new Date(data[key].last_updated_at * 1000).toLocaleString(),
    }));
  } catch (error) {
    console.log(`Error fetching price data: ${error}`);
  }
};

export const verifyPriceData = (assets = [], geckoIds = [], priceData = []) => {
  if (assets.length !== geckoIds.length) {
    const assetsSymbols = assets.map((asset) => asset.asset.toUpperCase());
    const missingSymbols = assetsSymbols.filter(
      (symbol) =>
        !priceData.find(
          (pd) => symbol.toUpperCase() === pd.symbol.toUpperCase()
        )
    );

    console.log('missingSymbols', missingSymbols);
    if (missingSymbols.length) {
      printMissingCoinsMessage(missingSymbols);
    }
  }
};
