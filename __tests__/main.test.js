import '../src/config';
import * as db from '../src/db';
import * as helpers from '../src/helpers';
import * as server from '../src/server';

describe('server', () => {
  let getAssetsStub;
  let getChangedAssetsStub;
  let uploadPricesStub;

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

    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call getAssets with data and verify the assets returned', async () => {
    await server.run();
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

    await server.run();
    expect(getAssetsStub).toHaveBeenCalledTimes(1);
  });

  it('should catch error and pass it as argument to printErrorMessage', async () => {
    const printErrorMessageStub = jest.spyOn(helpers, 'printErrorMessage');
    getChangedAssetsStub.mockImplementation(() => {
      return Promise.reject(new Error('oops'));
    });

    await server.run();
    expect(printErrorMessageStub).toHaveBeenCalledWith(new Error('oops'));
  });
});
