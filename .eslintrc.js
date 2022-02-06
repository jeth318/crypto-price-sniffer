export default {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ['prettier'],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
