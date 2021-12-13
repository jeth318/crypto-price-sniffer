require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');
const { DB_USERNAME, DB_PASSWORD, MONGODB_ENDPOINT } = process.env;
const {
  getGeckoIdsFromAssets,
  getPriceData,
} = require('./helpers');

// Connection URL
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${MONGODB_ENDPOINT}`;
const client = new MongoClient(url);

// Database Name
const dbName = process.env.DB_NAME;

async function updatePrices(assets) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('prices');
    const geckoIds = getGeckoIdsFromAssets(assets);
    await collection.insertMany(await getPriceData(geckoIds));
    client.close();
  } catch (error) {
    console.log('Error while updating the datebase:', error);
  }
}

async function isUniqueSignature(signature) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('signatures');
    const match = await collection.findOne({ signature });
    if (!match) {
      await collection.insertOne({ signature });
      client.close();
      console.log(
        'New hash signature detected. Assets have changed since the previous check.'
      );
      return true;
    } else {
      client.close();
      return false;
    }
  } catch (error) {
    console.log('Error while verifying signature:', error);
  }
}

module.exports = { updatePrices, isUniqueSignature };
