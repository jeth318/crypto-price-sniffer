import * as mockMongoDb from '../__mocks__/mongodb.cjs';
import * as db from '../src/db';
import * as helpers from '../src/helpers';

jest.mock('mongodb', () => mockMongoDb);

describe('db', () => {
  let getGeckoIdsFromAssetsStub;
  let consoleStub;
  let findChangedAssetsStub;
  let printInfoMessageStub;

  beforeEach(() => {
    mockMongoDb.mockFindOne.mockImplementation(async () => null);
    mockMongoDb.mockToArray.mockImplementation(() => [
      { assets: ['assetA'] },
      { assets: ['assetB'] },
    ]);
    printInfoMessageStub = jest
      .spyOn(helpers, 'printInfoMessage')
      .mockImplementation(() => null);
    findChangedAssetsStub = jest
      .spyOn(helpers, 'findChangedAssets')
      .mockImplementation(() => 'changedAssets');
    getGeckoIdsFromAssetsStub = jest
      .spyOn(helpers, 'getGeckoIdsFromAssets')
      .mockImplementation(() => ['gid1, gid2']);
    consoleStub = jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPrices', () => {
    it('should call insertMany with correct arguments', async () => {
      const getPriceDataStub = jest
        .spyOn(helpers, 'getPriceData')
        .mockImplementation(async () => Promise.resolve('priceData'));
      const verifyPriceDataStub = jest
        .spyOn(helpers, 'verifyPriceData')
        .mockImplementation(() => null);
      const assets = [{ geckoId: 'gid', symbol: 'symbol' }];

      await db.uploadPrices(assets);

      expect(getGeckoIdsFromAssetsStub).toHaveBeenCalledWith(assets);
      expect(getPriceDataStub).toHaveBeenCalledWith(['gid1, gid2']);
      expect(mockMongoDb.mockInsertMany).toHaveBeenCalledWith('priceData');
      expect(verifyPriceDataStub).toHaveBeenCalledWith(
        assets,
        ['gid1, gid2'],
        'priceData'
      );
    });

    it('should not call insertMany when promise rejects', async () => {
      const getPriceDataStub = jest
        .spyOn(helpers, 'getPriceData')
        .mockImplementation(async () => Promise.reject(new Error('oops')));
      const verifyPriceDataStub = jest
        .spyOn(helpers, 'verifyPriceData')
        .mockImplementation(() => null);
      const assets = [{ geckoId: 'gid', symbol: 'symbol' }];

      await db.uploadPrices(assets);

      expect(getGeckoIdsFromAssetsStub).toHaveBeenCalledWith(assets);
      expect(getPriceDataStub).toHaveBeenCalledWith(['gid1, gid2']);
      expect(mockMongoDb.mockInsertMany).not.toHaveBeenCalled();
      expect(verifyPriceDataStub).not.toHaveBeenCalled();
      expect(consoleStub).toHaveBeenCalledTimes(1);
      expect(consoleStub).toHaveBeenCalledWith(
        'Error while updating the datebase:',
        new Error('oops')
      );
    });
  });

  describe('getChangedAssets', () => {
    const defaultPayload = [
      'userSignature',
      'walletSignature',
      [
        {
          free: 1,
          locked: 1,
          asset: 'asset',
        },
      ],
    ];
    it('should return an empty array when signature match is found', async () => {
      mockMongoDb.mockFindOne.mockImplementation(async () => 'one');

      expect(await db.getChangedAssets(...defaultPayload)).toEqual([]);
    });

    it('should call insertOne with correct arguments when no signature match is found', async () => {
      const result = await db.getChangedAssets(...defaultPayload);
      expect(result).toEqual('changedAssets');
    });

    it('should call printInfoMessage with correct correct argument', async () => {
      const result = await db.getChangedAssets(...defaultPayload);
      expect(result).toEqual('changedAssets');
      expect(printInfoMessageStub).toHaveBeenCalledTimes(1);
      expect(printInfoMessageStub).toHaveBeenCalledWith('userSignature');
    });

    it('should default previousAssets to empty array when no last entry length', async () => {
      mockMongoDb.mockToArray.mockImplementation(async () => []);
      const result = await db.getChangedAssets(...defaultPayload);
      expect(result).toEqual('changedAssets');
      expect(findChangedAssetsStub).toHaveBeenCalledWith(
        [],
        [
          {
            free: 1,
            locked: 1,
            asset: 'asset',
          },
        ]
      );
    });
    it('should call findChangedAssets with correct arguments', async () => {
      consoleStub.mockRestore();
      const result = await db.getChangedAssets(...defaultPayload);
      expect(result).toEqual('changedAssets');
      expect(findChangedAssetsStub).toHaveBeenCalledWith(
        ['assetA'],
        [
          {
            free: 1,
            locked: 1,
            asset: 'asset',
          },
        ]
      );
    });

    it('should print error log with correct information when failing', async () => {
      mockMongoDb.mockFindOne.mockImplementationOnce(() =>
        Promise.reject(new Error('oops'))
      );
      await db.getChangedAssets(...defaultPayload);
      expect(findChangedAssetsStub).not.toHaveBeenCalled();
      expect(consoleStub).toHaveBeenCalledWith(
        'Error while verifying signature:',
        new Error('oops')
      );
    });
  });
});
