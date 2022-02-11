import chalk from 'chalk';

/* eslint-disable-next-line no-extend-native,func-names */
String.prototype.dedent = function () {
  return this.split('\n')
    .map((line) => line.trim())
    .join('\n');
};

export const getNewWalletSignatureMessage = (userSignature) => {
  return `
    New walletSignature detected for user ${chalk.grey(userSignature)}.
    Assets have changed since the previous poll.
    Fetching price data for the affected assets and uploading the results to the database...
  `.dedent();
};

export const getMissingCoinsMessage = (symbols) => {
  return `
    No coins could be matched in CoinGecko for the following symbols: ${symbols}.
    This means that no price data could be uploaded for these coins.
  `.dedent();
};

export const getErrorMessage = (error) => {
  if (error.isAxiosError) {
    return `
      ${chalk.redBright('NETWORK ERROR:')}
      ${chalk.cyan(`Target -> ${error.hostname}`)}
      ${chalk.yellow(`Reason -> ${error.message}`)}
    `.dedent();
  }
  return `
      ${chalk.redBright('ERROR:')}
      ${chalk.yellow('Reason ->', error.message)}
    `.dedent();
};

export const getUploadCompletedMessage = (assets) => {
  return `
    Price information for asset${
      assets.split(',').length > 1 ? 's' : ''
    } ${chalk.green.italic(assets)} was uploaded successfully.
    Server time: ${chalk.magenta(new Date())}
    `.dedent();
};
