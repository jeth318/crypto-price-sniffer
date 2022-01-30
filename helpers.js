const { cryptoSymbol } = require('crypto-symbol');

const { nameLookup } = cryptoSymbol({});
const axios = require('axios');
const coinList = require('./complete-coinlist.json');

const printInfoMessage = (userSignature) => {
  /* eslint-disable-next-line no-console */
  console.log(`
  New walletSignature detected for user ${userSignature}.
  Assets have changed since the previous poll.
  Fetching price data for the affected assets and uploading the results to the database.`);
};

const printMissingCoinsMessage = (symbols) => {
  /* eslint-disable-next-line no-console */
  console.log(`
  No coins could be matched in CoinGecko for the following symbols: ${symbols}.
  This means that no price data could be uploaded for these coins.
  `);
};

const getAssets = (data) =>
  data.balances.filter(
    ({ free, locked }) => parseFloat(free) > 0 || parseFloat(locked) > 0
  );

const getGeckoSymbolFromGeckoId = (geckoId) => {
  const match = coinList.find(
    ({ id }) => id.toLocaleUpperCase() === geckoId.toUpperCase()
  );
  return match ? match.symbol : null;
};

const getGeckoIdFromSymbol = (symbol) => {
  const matches = coinList.filter(
    (coin) => coin.symbol.toUpperCase() === symbol
  );
  return matches.length ? matches[0].id : null;
};

const getCoinNames = (assets) =>
  assets.map(({ asset }) => ({
    name: nameLookup(asset),
    symbol: asset,
    geckoId: getGeckoIdFromSymbol(asset),
  }));

const getGeckoIdsFromAssets = (assets) =>
  getCoinNames(assets)
    .map(({ geckoId }) => geckoId)
    .filter((id) => !!id);

const getPriceData = async (ids) => {
  const encodedIds = encodeURIComponent(ids.toString());
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodedIds}&vs_currencies=sek%2Cusd&include_last_updated_at=true`;
  const { data } = await axios(url);
  return Object.keys(data).map((key) => ({
    id: key,
    symbol: getGeckoSymbolFromGeckoId(key),
    last_updated_at: data[key].last_updated_at,
    sek: data[key].sek,
    usd: data[key].usd,
    date: new Date(data[key].last_updated_at * 1000).toLocaleString(),
  }));
};

const verifyPriceData = (assets = [], geckoIds = [], priceData = []) => {
  if (assets.length !== geckoIds.length) {
    const assetsSymbols = assets.map((asset) => asset.asset.toUpperCase());
    const missingSymbols = assetsSymbols.filter(
      (symbol) =>
        !priceData.find(
          (pd) => symbol.toUpperCase() === pd.symbol.toUpperCase()
        )
    );
    if (missingSymbols.length) {
      printMissingCoinsMessage(missingSymbols);
    }
  }
};

module.exports = {
  getAssets,
  getGeckoIdsFromAssets,
  getGeckoSymbolFromGeckoId,
  getCoinNames,
  getGeckoIdFromSymbol,
  getPriceData,
  printInfoMessage,
  verifyPriceData,
};
