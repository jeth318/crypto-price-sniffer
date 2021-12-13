require('dotenv').config({ path: '../.env' });
const { MongoClient } = require("mongodb");
const axios = require("axios");
const { sha256 } = require("js-sha256");
const { DB_USERNAME, DB_PASSWORD } = process.env;
const coinList = require('./complete-coinlist.json');

// Connection URL
const url =
    `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.d9tv0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(url);

// Database Name
const dbName = "crypto-prices";

// Interval (15 minutes)
const time = 60 * 1000 * 1;

const insertStuff = async (collection, stuff) =>
    await collection.insertMany(stuff);

const getGeckoSymbolFromGeckoId = (geckoId) => {
    const matches = coinList.filter(c => c.id.toUpperCase() === geckoId.toUpperCase());
    return matches.length ? matches[0].symbol : null;
}
const getPriceData = async (ids) => {
    const encodedIds = encodeURIComponent(ids.toString())
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodedIds}&vs_currencies=sek%2Cusd&include_last_updated_at=true`
    const { data } = await axios(url);
    const result = Object.keys(data).map((key) => ({
        id: key,
        symbol: getGeckoSymbolFromGeckoId(key),
        last_updated_at: data[key].last_updated_at,
        sek: data[key].sek,
        usd: data[key].usd,
        date: new Date(data[key].last_updated_at * 1000).toLocaleString(),
    }));

    updateDb(result)
    return result;
}
async function updateDb(prices) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("prices");
        await insertStuff(collection, prices);
        client.close();
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = getPriceData;