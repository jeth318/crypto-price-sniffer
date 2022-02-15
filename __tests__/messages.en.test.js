import * as messages from '../src/messages.en';

describe('messages', () => {
  describe('getNewWalletSignatureMessage', () => {
    it('should do right', () => {
      const expectedResult = `
        New walletSignature detected for user userSignature.
        Assets have changed since the previous poll.
        Fetching price data for the affected assets and uploading the results to the database...
      `;

      expect(messages.getNewWalletSignatureMessage('userSignature')).toEqual(
        expectedResult.dedent()
      );
    });
  });

  describe('getMissingCoinsMessage', () => {
    it('should do right', () => {
      const expectedResult = `
        No coins could be matched in CoinGecko for the following symbols: ADA, AAVE.
        This means that no price data could be uploaded for these coins.
      `;
      expect(messages.getMissingCoinsMessage('ADA, AAVE')).toEqual(
        expectedResult.dedent()
      );
    });
  });

  describe('getUploadCompletedMessage', () => {
    it('should call getUploadCompletedMessage with correct argument', () => {
      const expectedResult = `
        Price information for assets ADA, AAVE was uploaded successfully.
        Server time: null
    `;
      expect(messages.getUploadCompletedMessage('ADA, AAVE')).toEqual(
        expectedResult.dedent()
      );
    });
  });

  describe('getErrorMessage', () => {
    it('should print network error message when isAxiosError', () => {
      const error = {
        message: 'message',
        hostname: 'hostname',
        isAxiosError: true,
      };
      const expectedResult = `
        NETWORK ERROR:
        Target -> hostname
        Reason -> message
      `;

      expect(messages.getErrorMessage(error)).toEqual(expectedResult.dedent());
    });
  });
});
