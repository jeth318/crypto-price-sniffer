require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");
const axios = require("axios");
const { DB_USERNAME, DB_PASSWORD, MONGODB_ENDPOINT } = process.env;
const coinList = require("./complete-coinlist.json");

// Connection URL
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${MONGODB_ENDPOINT}`;
console.log(url);
const client = new MongoClient(url);

// Database Name
const dbName = "crypto-prices";

const insertStuff = async (collection, stuff) =>
  await collection.insertMany(stuff);

const getGeckoSymbolFromGeckoId = (geckoId) => {
  const matches = coinList.filter(
    (c) => c.id.toUpperCase() === geckoId.toUpperCase()
  );
  return matches.length ? matches[0].symbol : null;
};
const getPriceData = async (ids) => {
  const encodedIds = encodeURIComponent(ids.toString());
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodedIds}&vs_currencies=sek%2Cusd&include_last_updated_at=true`;
  const { data } = await axios(url);
  const result = Object.keys(data).map((key) => ({
    id: key,
    symbol: getGeckoSymbolFromGeckoId(key),
    last_updated_at: data[key].last_updated_at,
    sek: data[key].sek,
    usd: data[key].usd,
    date: new Date(data[key].last_updated_at * 1000).toLocaleString(),
  }));

  return result;
};
async function priceUpdater(geckoIds) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("prices");
    const prices = await getPriceData(geckoIds);
    const res = await insertStuff(collection, prices);
    console.log(res);
    client.close();
  } catch (error) {
    console.log("Error while updating DB:", error);
  }
}

module.exports = priceUpdater;
