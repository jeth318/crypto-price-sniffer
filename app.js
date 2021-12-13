require('dotenv').config();
const { Spot } = require('@binance/connector')
const { sha256 } = require('js-sha256');
const apiKey = process.env.BINANCE_API_KEY
const apiSecret = process.env.BINANCE_API_SECRET
const client = new Spot(apiKey, apiSecret)
const { cryptoSymbol } = require('crypto-symbol');
const coinList = require('./complete-coinlist.json');
const getPriceData = require('./price-updater');

const { nameLookup } = cryptoSymbol({});
const getGeckoIdFromSymbol = (symbol) => {
    const matches = coinList.filter(c => c.symbol.toUpperCase() === symbol);
    return matches.length ? matches[0].id : null;
}

const getCoinNames = assets => assets.map(coin => ({
    name: nameLookup(coin.asset),
    symbol: coin.asset,
    geckoId: getGeckoIdFromSymbol(coin.asset)
}));

let previousHash = '';

setInterval(() => {
    client.account()
        .then(async response => {
            const assets = response?.data?.balances?.filter(asset => parseFloat(asset.free) > 0 || parseFloat(asset.locked) > 0);
            const newHash = sha256(JSON.stringify(assets));

            if (!previousHash) {
                previousHash = newHash;
            } else if (previousHash === newHash) {
                const geckoIds = getCoinNames(assets).map(c => c.geckoId).filter(id => !!id);
                // Go ahead and update prices
                getPriceData(geckoIds);
                // Override the previous hash value with the new one
                previousHash = newHash;
            }
        })
        .catch(error => console.log('ERROR', error))
}, 3000);
