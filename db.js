require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");
const { DB_USERNAME, DB_PASSWORD, MONGODB_ENDPOINT } = process.env;
const { getGeckoIdsFromAssets, getPriceData } = require("./helpers");

// Connection URL
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${MONGODB_ENDPOINT}`;
const client = new MongoClient(url);

// Database Name
const dbName = process.env.DB_NAME;

async function updatePrices(assets) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("prices");
    const geckoIds = getGeckoIdsFromAssets(assets);
    await collection.insertMany(await getPriceData(geckoIds));
    client.close();
  } catch (error) {
    console.log("Error while updating the datebase:", error);
  }
}

async function updateAssetsSummary(assets) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("assets");
    await collection.insertMany(assets);
    client.close();
  } catch (error) {
    console.log("Error while updating the datebase:", error);
  }
}

async function getUpdatedAssets(previousAssets, assets) {
  return previousAssets.filter((a) => {
    const comp = assets.find((as) => as.asset === a.asset);
    return comp ? comp.free !== a.free || comp.locked !== a.locked : a.asset;
  });
}

async function isUniqueSignature(signature, assets) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("signatures");
    const match = await collection.findOne({ signature });
    if (!match) {
      const lastEntry = await collection.find().limit(1).sort({ $natural: -1 });
      const lastEntryList = await lastEntry.toArray();
      const previousAssets = lastEntryList ? lastEntryList[0].assets : [];
      const updatedAssets = getUpdatedAssets(previousAssets, assets);
      await collection.insertOne({ signature, assets });
      client.close();
      console.log(
        "New hash signature detected. Assets have changed since the previous check."
      );
      return updatedAssets;
    } else {
      client.close();
      return [];
    }
  } catch (error) {
    console.log("Error while verifying signature:", error);
  }
}

module.exports = { updatePrices, isUniqueSignature };
