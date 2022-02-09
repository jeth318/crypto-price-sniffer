import * as db from '../src/db';
import * as helpers from '../src/helpers';
let mockInsertMany = jest.fn(async () => Promise.resolve('insertMany'));
let mockFindOne = jest.fn(async () => Promise.resolve('findOne'));
let mockInsertOne = jest.fn(async () => Promise.resolve('insertOne'));

let mockCollection = jest.fn(() => ({
  insertMany: mockInsertMany,
  insertOne: mockInsertOne,
  findOne: mockFindOne,
}));

jest.mock('mongodb', () => ({
  MongoClient: () => ({
    connect: async () => Promise.resolve('connected'),
    close: jest.fn(),
    db: () => ({
      collection: mockCollection,
    }),
  }),
}));
jest.mock('crypto-symbol', () => ({
  cryptoSymbol: jest.fn(() => ({
    nameLookup: jest.fn(() => 'nameLookupMock'),
  })),
}));
describe('db', () => {
  let getGeckoIdsFromAssetsStub;

  beforeEach(() => {
    getGeckoIdsFromAssetsStub = jest
      .spyOn(helpers, 'getGeckoIdsFromAssets')
      .mockImplementation(() => ['gid1, gid2']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPrices', () => {
    it('should work', async () => {
      let getPriceDataStub = jest
        .spyOn(helpers, 'getPriceData')
        .mockImplementation(async () => Promise.resolve('priceData'));
      let verifyPriceDataStub = jest
        .spyOn(helpers, 'verifyPriceData')
        .mockImplementation(() => null);
      const assets = [{ geckoId: 'gid', symbol: 'symbol' }];

      await db.uploadPrices(assets);

      expect(getGeckoIdsFromAssetsStub).toHaveBeenCalledWith(assets);
      expect(getPriceDataStub).toHaveBeenCalledWith(['gid1, gid2']);
      expect(mockInsertMany).toHaveBeenCalledWith('priceData');
      expect(verifyPriceDataStub).toHaveBeenCalledWith(
        assets,
        ['gid1, gid2'],
        'priceData'
      );
    });

    it('should not work', async () => {
      let getPriceDataStub = jest
        .spyOn(helpers, 'getPriceData')
        .mockImplementation(async () => Promise.resolve([]));
      let verifyPriceDataStub = jest
        .spyOn(helpers, 'verifyPriceData')
        .mockImplementation(() => null);
      const assets = [{ geckoId: 'gid', symbol: 'symbol' }];

      await db.uploadPrices(assets);

      expect(getGeckoIdsFromAssetsStub).toHaveBeenCalledWith(assets);
      expect(getPriceDataStub).toHaveBeenCalledWith(['gid1, gid2']);
      expect(mockInsertMany).not.toHaveBeenCalled();
      expect(verifyPriceDataStub).toHaveBeenCalledWith(
        assets,
        ['gid1, gid2'],
        []
      );
    });
  });

  describe('findChangedAssets', () => {
    it('should return changed assets', async () => {
      const previousAssets = [
        {
          free: 1,
          locked: 1,
          asset: 'asset1',
        },
        {
          free: 1,
          locked: 0,
          asset: 'asset2',
        },
      ];

      const assets = [
        {
          free: 1,
          locked: 1,
          asset: 'asset1',
        },
        {
          free: 1,
          locked: 1,
          asset: 'asset2',
        },
      ];
      const changedAssets = [assets[1]];
      expect(await db.findChangedAssets(previousAssets, assets)).toEqual(
        changedAssets
      );
    });
  });

  describe('getChangedAssets', () => {
    it('should return empty array when no signature match is found', async () => {
      const assets = [
        {
          free: 1,
          locked: 1,
          asset: 'asset1',
        },
      ];

      expect(
        await db.getChangedAssets('userSignature', 'walletSignature', assets)
      ).toEqual([]);
    });
  });
});
