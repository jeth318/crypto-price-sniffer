import { ClientAccount, Coin, PriceData, AxiosFetchError } from './types/index';
import cs from 'crypto-symbol';
import axios, { AxiosError } from 'axios';

// eslint-disable-next-line
import coinList from '../complete-coinlist.json' assert { type: "json" };
import * as helpers from './helpers';
import * as messages from './messages.en';
import { appLogger, networkLogger } from './winston';
import { Asset } from './types';

const { nameLookup } = cs.cryptoSymbol({});

export const printInfoMessage = (userSignature) => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getNewWalletSignatureMessage(userSignature));
};

export const printMissingCoinsMessage = (symbols) => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getMissingCoinsMessage(symbols));
};

export const printErrorMessage = (error) => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getErrorMessage(error));
};

export const printMissingEnvMessage = () => {
  /* eslint-disable-next-line no-console */
  console.log(messages.getMissingEnvMessage());
};

export const printUploadCompletedMessage = (priceData) => {
  const assets = priceData
    .map((asset) => asset.symbol.toUpperCase())
    .toString()
    .split(',')
    .join(', ');
  /* eslint-disable-next-line no-console */
  console.log(messages.getUploadCompletedMessage(assets));
};

export const getAssets = (data: ClientAccount): Asset[] =>
  data.balances.filter(
    ({ free, locked }) => parseFloat(free) > 0 || parseFloat(locked) > 0
  );

export const findChangedAssets = async (previousAssets: Asset[], assets: Asset[]) =>
  assets.filter(({ asset, locked, free }) => {
    const comp = previousAssets.find((pa) => pa.asset === asset);
    return comp ? comp.free !== free || comp.locked !== locked : asset;
  });

export const getGeckoSymbolFromGeckoId = (geckoId: string) => {
  const match = coinList.find(
    ({ id }) => id.toLocaleUpperCase() === geckoId.toUpperCase()
  );
  return match ? match.symbol : null;
};

export const getGeckoIdFromSymbol = (symbol: string) => {
  const matches = coinList.filter(
    (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return matches.length ? matches[0].id : null;
};

export const getCoinNames = (assets: Asset[]) =>
  assets.map(({ asset }) => ({
    name: nameLookup(asset),
    symbol: asset,
    geckoId: helpers.getGeckoIdFromSymbol(asset)
  }));

export const getGeckoIdsFromAssets = (assets: Asset[]) =>
  helpers
    .getCoinNames(assets)
    .map(({ geckoId }) => geckoId)
    .filter((id) => !!id);

export const getPriceData = async (ids: Coin["geckoId"][]) => {
  try {
    const encodedIds = encodeURIComponent(ids.toString());
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodedIds}&vs_currencies=sek%2Cusd&include_last_updated_at=true`;
    const { data } = await axios.get(url);
    return Object.keys(data).map((key) => ({
      id: key,
      symbol: helpers.getGeckoSymbolFromGeckoId(key),
      last_updated_at: data[key].last_updated_at,
      sek: data[key].sek,
      usd: data[key].usd,
      date: `${new Date(data[key].last_updated_at * 1000).toLocaleString()}`,
    }));
  } catch (error) {
    helpers.errorLogger(error);
    helpers.printErrorMessage(error);
    return [];
  }
};

export const verifyPriceData = (assets: Asset[], geckoIds: Coin["geckoId"], priceData: PriceData[]) => {
  if (assets.length !== geckoIds.length) {
    const assetsSymbols = assets.map((asset) => asset.asset.toUpperCase());
    const missingSymbols = assetsSymbols.filter(
      (symbol) =>
        !priceData.find(
          (pd) => symbol.toUpperCase() === pd.symbol.toUpperCase()
        )
    );
    if (missingSymbols.length) {
      appLogger.info({ missingSymbols, assets, priceData });
      helpers.printMissingCoinsMessage(missingSymbols);
    }
  }
};

export const errorLogger = (data: any) => {
  if (data?.isAxiosError) {
    networkLogger.error({ message: data });
  } else {
    appLogger.error({ message: data });
  }
};
