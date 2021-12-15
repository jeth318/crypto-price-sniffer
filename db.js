require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");
const { DB_USERNAME, DB_PASSWORD, MONGODB_ENDPOINT } = process.env;
const {
  getGeckoIdsFromAssets,
  getPriceData,
  printInfoMessage,
} = require("./helpers");

const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${MONGODB_ENDPOINT}`;
const client = new MongoClient(url);
const dbName = process.env.DB_NAME;

const uploadPrices = async (assets) => {
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
};

// Work in progress
const getClosestMatch = async ({ time, symbol }) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const response = db.collection("prices").find({ symbol });
    const prices = await response.toArray();

    const closestMatch = prices.reduce(
      (a, b) =>
        Math.abs(info.time - a.last_updated_at) <
        Math.abs(info.time - b.last_updated_at)
          ? a
          : b,
      {}
    );

    client.close();
    console.log(
      "Time of transaction:",
      new Date(info.time * 1000).toLocaleString()
    );
    return closestMatch;
  } catch (error) {
    console.log("Error:", error);
  }
};

const findChangedAssets = async(previousAssets, assets) => {
  return previousAssets.filter((pa) => {
    const comp = assets.find((a) => a.asset === pa.asset);
    return comp ? comp.free !== pa.free || comp.locked !== pa.locked : pa.asset;
  });
}

const getChangedAssets = async(userSignature, walletSignature, assets) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("signatures");
    const signatureMatch = await collection.findOne({
      userSignature,
      walletSignature,
    });

    if (!signatureMatch) {
      const lastEntry = collection
        .find({ userSignature })
        .limit(1)
        .sort({ $natural: -1 });
      const lastEntryList = await lastEntry.toArray();
      await collection.insertOne({ userSignature, walletSignature, assets });
      client.close();
      printInfoMessage(userSignature);
      const previousAssets = lastEntryList.length
        ? lastEntryList[0].assets
        : [];
      return findChangedAssets(previousAssets, assets);
    } else {
      client.close();
      return [];
    }
  } catch (error) {
    console.log("Error while verifying signature:", error);
  }
}

module.exports = { uploadPrices, getChangedAssets, getClosestMatch };
