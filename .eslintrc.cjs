module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['prettier'],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
    'import/no-self-import': 0,
    'import/extensions': [
      'error',
      {
        js: 'ignorePackages',
        json: 'ignorePackages',
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/__mocks__/*'],
      env: {
        jest: true,
      },
    },
  ],
};
