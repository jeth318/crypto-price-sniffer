import axios from 'axios';
import * as helpers from '../src/helpers';
import * as messages from '../src/messages.en';

jest.mock('axios');
describe('helpers', () => {
  let logStub;
  let getNewWalletSignatureMessageStub;
  let getMissingCoinsMessageStub;
  let getUploadCompletedMessageStub;

  beforeEach(() => {
    logStub = jest.spyOn(console, 'log').mockImplementation(() => 'jonas');
    getNewWalletSignatureMessageStub = jest
      .spyOn(messages, 'getNewWalletSignatureMessage')
      .mockImplementation(() => 'walletSignatureMessage');

    getMissingCoinsMessageStub = jest
      .spyOn(messages, 'getMissingCoinsMessage')
      .mockImplementation(() => 'missingCoinsMessage');

    getUploadCompletedMessageStub = jest
      .spyOn(messages, 'getUploadCompletedMessage')
      .mockImplementation(() => 'uploadCompletedMessage');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('printInfoMessage', () => {
    it('should result in console.log with given user signature present', () => {
      helpers.printInfoMessage('USER_SIGNATURE');
      expect(getNewWalletSignatureMessageStub).toHaveBeenCalledWith(
        'USER_SIGNATURE'
      );
      expect(logStub).toHaveBeenCalledWith('walletSignatureMessage');
    });
  });

  describe('printMissingCoinsMessage', () => {
    it('should result in console.log with given coin symbol present', () => {
      helpers.printMissingCoinsMessage('SYMBOLS');
      expect(getMissingCoinsMessageStub).toHaveBeenCalledWith('SYMBOLS');
      expect(logStub).toHaveBeenCalledWith('missingCoinsMessage');
    });
  });

  describe('printUploadCompletedMessage', () => {
    it('should result in console.log with correct message when single asset', () => {
      const priceData = [{ symbol: 'ada' }];
      helpers.printUploadCompletedMessage(priceData);
      expect(getUploadCompletedMessageStub).toHaveBeenCalledWith('ADA');
      expect(logStub).toHaveBeenCalledWith('uploadCompletedMessage');
    });

    it('should result in console.log with correct message when multiple assets', () => {
      const priceData = [{ symbol: 'ada' }, { symbol: 'aave' }];
      helpers.printUploadCompletedMessage(priceData);
      expect(getUploadCompletedMessageStub).toHaveBeenCalledWith('ADA, AAVE');
      expect(logStub).toHaveBeenCalledWith('uploadCompletedMessage');
    });
  });

  describe('getAssets', () => {
    it('should return a list containing assets that has a free value greater than 0 ', () => {
      const responseMock = {
        balances: [{ geckoId: 'geckoId1', free: '0.050', locked: '0.000' }],
      };

      expect(helpers.getAssets(responseMock)).toEqual([
        responseMock.balances[0],
      ]);
    });

    it('should return a list containing assets that has a locked value greater than 0 ', () => {
      const responseMock = {
        balances: [{ geckoId: 'geckoId2', free: '0.000', locked: '0.300' }],
      };

      expect(helpers.getAssets(responseMock)).toEqual([
        responseMock.balances[0],
      ]);
    });

    it('should return a list containing assets that has a locked value greater than 0 ', () => {
      const responseMock = {
        balances: [{ geckoId: 'geckoId3', free: '0.000', locked: '0.000' }],
      };

      expect(helpers.getAssets(responseMock)).toEqual([]);
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
      expect(await helpers.findChangedAssets(previousAssets, assets)).toEqual(
        changedAssets
      );
    });
  });

  describe('getGeckoSymbolFromGeckoId', () => {
    it('should return symbol matching the given id', () => {
      expect(helpers.getGeckoSymbolFromGeckoId('bitcoin')).toEqual('btc');
    });

    it('should return empty null when no match', () => {
      expect(helpers.getGeckoSymbolFromGeckoId('no_match_id')).toEqual(null);
    });
  });

  describe('getGeckoIdFromSymbol', () => {
    it('should return id matching the given symbol', () => {
      expect(helpers.getGeckoIdFromSymbol('btc')).toEqual('bitcoin');
    });

    it('should return empty null when no match', () => {
      expect(helpers.getGeckoIdFromSymbol('no_match_symbol')).toEqual(null);
    });
  });
  describe('getCoinNames', () => {
    it('should return object with correct name, symbol and geckoId', () => {
      const result = [
        {
          name: 'nameLookupMock',
          symbol: 'BTC',
          geckoId: 'bitcoin',
        },
      ];
      const assets = [{ asset: 'BTC', free: '1', locked: '0.00000000' }];
      expect(helpers.getCoinNames(assets)).toEqual(result);
    });

    it('should call getGeckoIdFromSymbol with correct argument', () => {
      jest
        .spyOn(helpers, 'getGeckoIdFromSymbol')
        .mockImplementation(() => 'getGeckoIdFromSymbolMock');
      const assets = [{ asset: 'BTC', free: '1', locked: '0.00000000' }];
      const result = [
        {
          name: 'nameLookupMock',
          symbol: 'BTC',
          geckoId: 'getGeckoIdFromSymbolMock',
        },
      ];
      expect(helpers.getCoinNames(assets)).toEqual(result);
    });
  });

  describe('getGeckoIdsFromAssets', () => {
    it('should call getCoinNames with assets', () => {
      jest
        .spyOn(helpers, 'getCoinNames')
        .mockImplementation(() => [{ geckoId: 'geckoId' }]);

      expect(helpers.getGeckoIdsFromAssets('assets')).toEqual(['geckoId']);
    });

    it('should exclude ids not found by getCoinNames', () => {
      jest
        .spyOn(helpers, 'getCoinNames')
        .mockImplementation(() => [
          { geckoId: 'geckoId1' },
          { geckoId: undefined },
          { geckoId: 'geckoId2' },
        ]);

      expect(helpers.getGeckoIdsFromAssets('assets')).toEqual([
        'geckoId1',
        'geckoId2',
      ]);
    });

    it('should call console log with error message', () => {
      jest
        .spyOn(helpers, 'getCoinNames')
        .mockImplementation(() => [
          { geckoId: 'geckoId1' },
          { geckoId: undefined },
          { geckoId: 'geckoId2' },
        ]);

      expect(helpers.getGeckoIdsFromAssets('assets')).toEqual([
        'geckoId1',
        'geckoId2',
      ]);
    });
  });
  describe('getPriceData', () => {
    it('should call coingecko API with correct url', async () => {
      jest
        .spyOn(helpers, 'getGeckoSymbolFromGeckoId')
        .mockImplementation(() => 'geckoSymbol');

      const mockResponse = {
        data: {
          btc: {
            sek: 10,
            usd: 1.2,
            last_updated_at: 1644049060,
          },
        },
      };
      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await helpers.getPriceData(['btc']);

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=btc&vs_currencies=sek%2Cusd&include_last_updated_at=true'
      );

      expect(result).toEqual([
        {
          id: 'btc',
          sek: 10,
          usd: 1.2,
          last_updated_at: 1644049060,
          date: '05/02/2022, 09:17:40',
          symbol: 'geckoSymbol',
        },
      ]);
    });

    it('should catch error and call it out through console log', async () => {
      // axios.get.mockReturnValue(Promise.reject('error_123'));
      axios.get.mockImplementation(() => {
        throw new Error('oops');
      });

      try {
        await helpers.getPriceData(['btc']);
      } catch (error) {
        expect(logStub).toHaveBeenCalledWith(
          'Error fetching price data: Error: oops'
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://api.coingecko.com/api/v3/simple/price?ids=btc&vs_currencies=sek%2Cusd&include_last_updated_at=true'
        );
      }
    });

    it('should exclude ids not found by getCoinNames', () => {
      jest
        .spyOn(helpers, 'getCoinNames')
        .mockImplementation(() => [
          { geckoId: 'geckoId1' },
          { geckoId: undefined },
          { geckoId: 'geckoId2' },
        ]);

      expect(helpers.getGeckoIdsFromAssets('assets')).toEqual([
        'geckoId1',
        'geckoId2',
      ]);
    });
  });

  describe('verifyPriceData', () => {
    it('should do nothing when assets and geckoIds width identical length', async () => {
      const printMissingCoinsMessageStub = jest
        .spyOn(helpers, 'printMissingCoinsMessage')
        .mockImplementation(() => 'geckoSymbol');

      helpers.verifyPriceData(['asset1'], ['geckoId1'], []);

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();
    });

    it('should do nothing when no missing symbols', () => {
      const printMissingCoinsMessageStub = jest
        .spyOn(helpers, 'printMissingCoinsMessage')
        .mockImplementation(() => 'geckoSymbol');

      const assets = [{ asset: 'btc' }];
      const priceData = [{ symbol: 'BTC' }];
      helpers.verifyPriceData(assets, [], priceData);

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();

      helpers.verifyPriceData([], ['geckoId1'], []);

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();
    });

    it('should console log missing coins message', () => {
      const printMissingCoinsMessageStub = jest
        .spyOn(helpers, 'printMissingCoinsMessage')
        .mockImplementation(() => 'geckoSymbol');

      const assets = [{ asset: 'btc' }];
      const priceData = [{ symbol: 'BTC' }];
      helpers.verifyPriceData(assets, [], priceData);

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();

      helpers.verifyPriceData(assets, ['geckoId1'], []);

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();
    });

    it('should do nothing when given no assets and geckoIds have identical length', () => {
      const printMissingCoinsMessageStub = jest
        .spyOn(helpers, 'printMissingCoinsMessage')
        .mockImplementation(() => 'geckoSymbol');

      const assets = [{ asset: 'btc' }, { asset: 'aave' }];
      const priceData = [{ symbol: 'geckoId1' }];
      const geckoIds = ['btc'];

      helpers.verifyPriceData(assets, geckoIds, priceData);

      expect(printMissingCoinsMessageStub).toHaveBeenCalledWith([
        'BTC',
        'AAVE',
      ]);
    });

    it('should default all arguments as empty arrays', () => {
      const printMissingCoinsMessageStub = jest
        .spyOn(helpers, 'printMissingCoinsMessage')
        .mockImplementation(() => 'geckoSymbol');

      helpers.verifyPriceData();

      expect(printMissingCoinsMessageStub).not.toHaveBeenCalled();
    });
  });
});
