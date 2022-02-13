import * as mockBinanceConnector from '../__mocks__/@binance/connector.cjs';
import * as mockSha256 from '../__mocks__/js-sha256.cjs';
import * as db from '../src/db';
import * as helpers from '../src/helpers';
import * as app from '../src/app';

jest.mock('@binance/connector', () => mockBinanceConnector);
jest.mock('js-sha256', () => mockSha256);

describe('app', () => {
  let getAssetsStub;
  let getChangedAssetsStub;
  let uploadPricesStub;
  let consoleStub;

  beforeEach(() => {
    getAssetsStub = jest.spyOn(helpers, 'getAssets').mockImplementation(() => {
      return 'assets';
    });

    getChangedAssetsStub = jest
      .spyOn(db, 'getChangedAssets')
      .mockImplementation(() => {
        return 'changedAssets';
      });

    uploadPricesStub = jest
      .spyOn(db, 'uploadPrices')
      .mockImplementation(() => null);

    consoleStub = jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAssets with binance data', async () => {
    await app.run();
    expect(getAssetsStub).toHaveBeenCalledTimes(1);
    expect(getAssetsStub).toHaveBeenCalledWith('data');
    expect(getChangedAssetsStub).toHaveBeenCalledTimes(1);
    expect(getChangedAssetsStub).toHaveBeenCalledWith(
      'sha256String',
      'sha256String',
      'assets'
    );
    expect(uploadPricesStub).toHaveBeenCalledTimes(1);
    expect(uploadPricesStub).toHaveBeenCalledWith('changedAssets');
  });

  it('should not call uploadPrices when no changed assets', async () => {
    getChangedAssetsStub.mockImplementation(() => {
      return [];
    });

    await app.run();
    expect(getAssetsStub).toHaveBeenCalledTimes(1);
    expect(getAssetsStub).toHaveBeenCalledWith('data');
    expect(getChangedAssetsStub).toHaveBeenCalledTimes(1);
    expect(getChangedAssetsStub).toHaveBeenCalledWith(
      'sha256String',
      'sha256String',
      'assets'
    );
    expect(uploadPricesStub).toHaveBeenCalledTimes(0);
  });

  it('should catch error and pass it as argument to errorLogger', async () => {
    const errorLoggerStub = jest.spyOn(helpers, 'errorLogger');
    getChangedAssetsStub.mockImplementation(() => {
      return Promise.reject(new Error('oops'));
    });

    await app.run();
    expect(errorLoggerStub).toHaveBeenCalledTimes(1);
    expect(errorLoggerStub).toHaveBeenCalledWith(new Error('oops'));
  });

  it('should catch error and pass it as argument to printErrorMessage', async () => {
    const printErrorMessageStub = jest.spyOn(helpers, 'printErrorMessage');
    getChangedAssetsStub.mockImplementation(() => {
      return Promise.reject(new Error('oops'));
    });

    await app.run();
    expect(printErrorMessageStub).toHaveBeenCalledWith(new Error('oops'));
  });
});
