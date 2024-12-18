# Crypto Price Sniffer for Tax Reports

## Overview

**Crypto Price Sniffer** is a Node.js application that helps users track their Binance transactions to generate accurate tax reports in Sweden. The app connects to the Binance API and frequently polls the user's wallet for changes in transaction data, such as coin purchases, sales, or conversions. When a difference is detected, it fetches the current SEK (Swedish Krona) value of the coin(s) involved in the transaction and stores this data in a MongoDB database. This information is essential for generating cryptocurrency-related tax reports in Sweden.

## Features

- **Frequent Polling**: Periodically checks the Binance wallet for new or updated transactions.
- **Change Detection**: Identifies differences in the wallet between checks to detect new or modified transactions.
- **SEK Value Lookup**: Retrieves the current SEK value for coins involved in changes or new transactions.
- **Database Logging**: Stores transaction details and their SEK value in MongoDB for future use.
- **Swedish Tax Compliance**: Specifically designed to simplify the process of generating tax reports for cryptocurrency holdings and transactions in Sweden.

## Requirements

- **Node.js**: Version 14 or higher.
- **Database**: A MongoDB database to store transaction records.
- **Binance API Key**: A valid Binance API key to access wallet data.
- **Internet Access**: Required to fetch live data from Binance and convert cryptocurrencies to SEK.

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/crypto-price-sniffer.git
cd crypto-price-sniffer
```

### Step 2: Install Dependencies

Ensure you have Node.js installed. Then, run the following command to install the required dependencies:

```bash
npm install
```

### Step 3: Configure the App

Create a `.env` file in the root directory with the following environment variables:

```env
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
MONGODB_ENDPOINT=your-mongodb-endpoint
DB_PASSWORD=your-mongo-db-password
DB_USERNAME=your-mongo-db-username
DB_NAME=your-database-name
POLL_INTERVAL=60000
```

#### Environment Variables Explanation:

- **BINANCE_API_KEY**: Your Binance API key. This key allows the app to connect to your Binance account and retrieve transaction data.
  
- **BINANCE_API_SECRET**: Your Binance API secret. This secret is used in combination with the API key for secure authentication.

- **MONGODB_ENDPOINT**: The MongoDB connection string used to connect to your MongoDB database (e.g., from MongoDB Atlas or your own server). This typically includes the cluster URL and any connection options.
  
- **DB_PASSWORD**: The password for your MongoDB database user.

- **DB_USERNAME**: The username for your MongoDB database user.

- **DB_NAME**: The name of the MongoDB database where transaction data will be stored.

- **POLL_INTERVAL**: The frequency, in milliseconds, at which the app will check for new or updated transactions from Binance. The default is set to 60,000 ms (1 minute). You can adjust this to your preferred polling interval.

### Step 4: Set Up the Database

Make sure you have a MongoDB database set up (e.g., via MongoDB Atlas) and that your connection string (from `MONGODB_ENDPOINT`) is correct. Ensure the database has the necessary permissions for your `DB_USERNAME` and `DB_PASSWORD`.

### Step 5: Run the Application

Once everything is configured, start the application:

```bash
npm start
```

The app will begin polling your Binance wallet for transactions at the specified interval and log any detected changes to MongoDB.

## Usage

The app runs continuously in the background and polls your Binance wallet at the interval defined in `POLL_INTERVAL`. Here's how it works:

1. **Polling**: At the defined intervals (default is every minute), the app fetches the user's Binance transaction data.
2. **Change Detection**: The app compares the current data with the previously stored data to identify new or modified transactions.
3. **SEK Conversion**: For each detected change, the app retrieves the current SEK value of the affected cryptocurrency using an external API.
4. **Database Logging**: The app logs the transaction details, including the SEK value, into the MongoDB database for future reference.

## Security

Ensure that the `.env` file is kept secure and not committed to version control. If you're using a service like GitHub, add the `.env` file to your `.gitignore` to prevent sensitive data from being exposed.

## Contributions

We welcome contributions to improve the application. Feel free to open issues or submit pull requests to enhance functionality, fix bugs, or add features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

For any questions or support, feel free to open an issue or reach out to the repository owner.
