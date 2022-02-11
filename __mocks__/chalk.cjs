module.exports = {
  green: { italic: (assets) => assets },
  grey: (arg) => arg,
  redBright: (arg) => arg,
  cyan: (arg) => arg,
  yellow: (arg) => arg,
  italic: jest.fn().mockReturnThis(),
  magenta: () => null,
};
