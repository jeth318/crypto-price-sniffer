const { cryptoSymbol } = require("crypto-symbol");
const { nameLookup } = cryptoSymbol({});
const axios = require("axios");
const coinList = require("./complete-coinlist.json");

const getAssets = (data) => {
  return data.balances.filter(
    (asset) => parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0
  );
};

const getGeckoSymbolFromGeckoId = (geckoId) => {
  const match = coinList.find(
    (coin) => coin.id.toLocaleUpperCase() === geckoId.toUpperCase()
  );
  return match ? match.symbol : null;
};

const getGeckoIdFromSymbol = (symbol) => {
  const matches = coinList.filter((c) => c.symbol.toUpperCase() === symbol);
  return matches.length ? matches[0].id : null;
};

const getCoinNames = (assets) =>
  assets.map((coin) => ({
    name: nameLookup(coin.asset),
    symbol: coin.asset,
    geckoId: getGeckoIdFromSymbol(coin.asset),
  }));

const getGeckoIdsFromAssets = (assets) =>
  getCoinNames(assets)
    .map((coin) => coin.geckoId)
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

const printInfoMessage = (userSignature) => {
  console.log(`
  New walletSignature detected for user ${userSignature}.
  Assets have changed since the previous poll.
  Fetching price data for the affected assets and uploading the results to the database.`
)};

module.exports = {
  getAssets,
  getGeckoIdsFromAssets,
  getGeckoSymbolFromGeckoId,
  getCoinNames,
  getGeckoIdFromSymbol,
  getPriceData,
  printInfoMessage,
};
