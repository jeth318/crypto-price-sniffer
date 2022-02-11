import dotenv from 'dotenv';
import * as mongodb from 'mongodb';

import {
  getGeckoIdsFromAssets,
  getPriceData,
  printInfoMessage,
  verifyPriceData,
  findChangedAssets,
  printUploadCompletedMessage,
} from './helpers.js';

dotenv.config();

const { DB_USERNAME, DB_PASSWORD, MONGODB_ENDPOINT } = process.env;
const url = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${MONGODB_ENDPOINT}`;
const client = new mongodb.MongoClient(url);
const dbName = process.env.DB_NAME;

export const uploadPrices = async (assets) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('prices');
    const geckoIds = getGeckoIdsFromAssets(assets);

    const priceData = await getPriceData(geckoIds);
    verifyPriceData(assets, geckoIds, priceData);
    if (priceData.length) {
      await collection.insertMany(priceData);
      printUploadCompletedMessage(priceData);
    }
    client.close();
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log('Error while updating the datebase:', error);
  }
};

// Work in progress
/* istanbul ignore next */
export const getClosestMatch = async ({ info, symbol }) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const response = db.collection('prices').find({ symbol });
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
    /* eslint-disable-next-line no-console */
    console.log(
      'Time of transaction:',
      new Date(info.time * 1000).toLocaleString()
    );
    return closestMatch;
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log('Error:', error);
    return null;
  }
};

export const getChangedAssets = async (
  userSignature,
  walletSignature,
  assets
) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('signatures');
    const signatureMatch = await collection.findOne({
      userSignature,
      walletSignature,
    });
    if (signatureMatch) {
      client.close();
      return [];
    }
    const lastEntry = collection
      .find({ userSignature })
      .limit(1)
      .sort({ $natural: -1 });
    const lastEntryList = await lastEntry.toArray();
    await collection.insertOne({ userSignature, walletSignature, assets });
    client.close();
    printInfoMessage(userSignature);
    const previousAssets = lastEntryList.length ? lastEntryList[0].assets : [];
    return findChangedAssets(previousAssets, assets);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log('Error while verifying signature:', error);
    return [];
  }
};
