export const error = jest.fn();
export const info = jest.fn();
export default {
  format: {
    json: jest.fn(),
  },
  transports: {
    File: jest.fn(),
  },
  createLogger: () => ({
    error,
    info,
  }),
};
