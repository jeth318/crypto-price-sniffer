module.exports = {
  green: { italic: (assets) => assets },
  grey: (arg) => arg,
  italic: jest.fn().mockReturnThis(),
  magenta: () => null,
};
