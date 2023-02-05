import * as winston from '../src/winston.js';
import * as winstonMock from '../__mocks__/winston.js';

describe('winston', () => {
  describe('networkLogger', () => {
    it('should return correct object', () => {
      const a = {
        error: winstonMock.error,
        info: winstonMock.info,
      };

      expect(winston.networkLogger).toEqual(a);
    });
  });

  describe('appLogger', () => {
    it('should return correct object', () => {
      const a = {
        error: winstonMock.error,
        info: winstonMock.info,
      };

      expect(winston.appLogger).toEqual(a);
    });
  });
});
