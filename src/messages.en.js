import chalk from 'chalk';

export const getNewWalletSignatureMessage = (userSignature) => {
  return `
    New walletSignature detected for user ${chalk.grey(userSignature)}.
    Assets have changed since the previous poll.
    Fetching price data for the affected assets and uploading the results to the database...`;
};

export const getMissingCoinsMessage = (symbols) => {
  return `
    No coins could be matched in CoinGecko for the following symbols: ${symbols}.
    This means that no price data could be uploaded for these coins.
    `;
};

export const getUploadCompletedMessage = (assets) => {
  return `
    Price information for asset${
      assets.split(',').length > 1 ? 's' : ''
    } ${chalk.green.italic(assets)} was uploaded successfully.
    Server time: ${chalk.magenta(new Date())}
    `;
};
