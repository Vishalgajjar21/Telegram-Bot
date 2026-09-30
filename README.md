# WhaleTracker

## 📌 Overview
WhaleTracker Bot is a **Telegram bot** that allows users to **track wallet transactions, monitor balances, and receive real-time alerts** for Ethereum wallets. It leverages **Alchemy's WebSocket API** for live transaction updates and integrates **AI-powered insights** for advanced wallet analytics.

## 🔥 Features
- **Track & Untrack Wallets**: Start tracking any Ethereum wallet with a simple command.
- **Real-Time Alerts**: Get notified instantly when a tracked wallet sends or receives transactions.
- **Transaction History**: View all past transactions of any Ethereum wallet.
- **Wallet Balance Check**: Fetch live balances of tracked wallets.
- **Whale Analytics**: Analyze wallet activity, transaction frequency, total received/sent, and more.
- **Interactive Commands & Menus**: Inline buttons for a better user experience.
- **Error Handling**: Ensures stable bot performance.

## 🚀 Commands
| Command | Description |
|---------|------------|
| `/start` | Start the bot and get a welcome message. |
| `/track <wallet>` | Track an Ethereum wallet. |
| `/untrack <wallet>` | Stop tracking a wallet. |
| `/transactions <wallet>` | View past transactions of a wallet. |
| `/balance <wallet>` | Check the current balance of a wallet. |
| `/analytics <wallet>` | Get wallet analytics, including total transactions, received, sent, and frequency. |
| `/help` | View all available commands. |

## 🛠️ Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Vishalgajjar21/WhaleTracker-.git
   cd WhaleTracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add:
   ```env
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   ALCHEMY_API_KEY=your-alchemy-api-key
   MONGODB_URI=your-mongodb-connection-string
   ```
4. Start the bot:
   ```bash
   nodemon server.js
   ```

## 📡 Tech Stack
- **Node.js** – Backend
- **Telegram Bot API** – Messaging
- **Alchemy API** – Real-time Ethereum transactions
- **MongoDB** – Database for tracking wallets

## 🤖 How It Works
1. **Users track wallets** using `/track <wallet>`.
2. **Bot monitors transactions** in real time using **Alchemy WebSocket API**.
3. **Notifications are sent** whenever a transaction occurs.
4. **Users can check balance & analytics** at any time.

## 📢 Contributing
Feel free to contribute by submitting a PR or reporting issues. Suggestions are always welcome!

## 🎯 Future Enhancements
- Support for multiple blockchains (e.g., Binance Smart Chain, Polygon)
- NFT tracking & analysis
- Gas fee predictions
- Customizable alert preferences

## 📝 License
This project is open-source under the MIT License.

🚀 **Built with ❤️ by Vishal Gajjar**

