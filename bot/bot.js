require("dotenv").config({ path: "../.env" }); // Load env from root
const Web3 = require("web3");

const TelegramBot = require("node-telegram-bot-api");
const {
  handleStart,
  trackWallet,
  untrackWallet,
  handleTransactions,
  checkBalance,
  showWalletAnalytics,
  checkAddress,
} = require("../services/command");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const userActionMap = new Map();

// ✅ Handle commands
bot.onText(/\/start/, (msg) => handleStart(bot, msg));

bot.onText(/\/transactions (0x[a-fA-F0-9]{40})/, (msg, match) =>
  handleTransactions(bot, msg, match)
);
bot.onText(/\/track (0x[a-fA-F0-9]{40})/, (msg, match) =>
  trackWallet(bot, msg, match)
);
bot.onText(/\/untrack (0x[a-fA-F0-9]{40})/, (msg, match) =>
  untrackWallet(bot, msg, match)
);

bot.onText(/\/balance (0x[a-fA-F0-9]{40})/, (msg, match) =>
  checkBalance(bot, msg, match)
);
bot.onText(/\/analytics (0x[a-fA-F0-9]{40})/, (msg, match) =>
  showWalletAnalytics(bot, msg, match[1])
);
bot.onText(/\/help/, (msg) => {
  const helpMessage = `
  📌 *Bot Commands & Usage Guide*:
  
  🔹 */start* - Start the bot and get a welcome message.
  
  🔹 */transactions <wallet_address>* - View recent transactions of a wallet.
  *Example:* \`/transactions 0x1234567890abcdef...\`
  
  🔹 */track <wallet_address>* - Start tracking a wallet for real-time updates.
  *Example:* \`/track 0x1234567890abcdef...\`
  
  🔹 */untrack <wallet_address>* - Stop tracking a wallet.
  *Example:* \`/untrack 0x1234567890abcdef...\`
  
🔹 */balance <wallet_address>* - Check the current balance of a wallet.
*Example:* \`/balance 0x1234567890abcdef...\`

🔹 */analytics <wallet_address>* - Get detailed wallet analytics, including transaction history and trends.
*Example:* \`/analytics 0x1234567890abcdef...\`

ℹ️ *Use the correct Ethereum wallet address format (0x followed by 40 hex characters) when using commands.*

🚀 Happy tracking!  
`;

  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: "Markdown" });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Button-based flow
  if (text === "➕ Add tracker") {
    userActionMap.set(chatId, "add");
    return bot.sendMessage(
      chatId,
      "📥 Please send the wallet address to *track*.",
      { parse_mode: "Markdown" }
    );
  }

  if (text === "❌ Remove tracker") {
    userActionMap.set(chatId, "remove");
    return bot.sendMessage(
      chatId,
      "📥 Please send the wallet address to *untrack*.",
      { parse_mode: "Markdown" }
    );
  }

  // If text is a valid Ethereum address
  if (Web3.utils.isAddress(text)) {
    const action = userActionMap.get(chatId);
    if (action === "add") {
      await trackWallet(bot, msg, [null, text]);
    } else if (action === "remove") {
      await untrackWallet(bot, msg, [null, text]);
    } else {
      // Default behavior if no previous action is recorded
      await bot.sendMessage(chatId, `✅ Received address: \`${text}\``, {
        parse_mode: "Markdown",
      });
    }

    userActionMap.delete(chatId);
    return;
  }

  // If the text is an invalid Ethereum address, send a warning
  if (/^(0x)?[0-9a-fA-F]{40}$/.test(text)) {
    await bot.sendMessage(
      chatId,
      "⚠️ Invalid Ethereum address. Please try again."
    );
    return;
  }
  // If the message is neither a valid nor an invalid address, do nothing (ignore)
});

// ✅ Error handling
bot.on("polling_error", (error) => console.error("Polling error:", error));

// Add this after your command handlers
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = msg.chat.id;
  try {
    if (data.startsWith("refresh_tx_")) {
      const walletAddress = data.replace("refresh_tx_", "");
      await handleTransactions(bot, msg, [null, walletAddress]);
    } //
    else if (data === "ask_wallet_address") {
      await bot.sendMessage(
        chatId,
        "📥 Please send your Ethereum wallet address:"
      ),
        userActionMap.set(chatId, "add");
    } //
    else if (data.startsWith("refresh_balance_")) {
      const walletAddress = data.replace("refresh_balance_", "");

      await checkBalance(bot, msg, [null, walletAddress]);
    } //
    else if (data.startsWith("address-prompt")) {
      const walletAddress = data.replace("address-prompt", "");

      await checkAddress(bot, msg, [null, walletAddress]);
    } //
    else if (data.startsWith("untrack-wallet")) {
      const walletAddress = data.replace("untrack-wallet", "");
      // Respond to Telegram to remove "loading" animation
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "✅ Untracked!",
      });
      await untrackWallet(bot, msg, [null, walletAddress]);
    } //
    else if (data.startsWith("view_tx_")) {
      const walletAddress = data.replace("view_tx_", "");
      await handleTransactions(bot, msg, [null, walletAddress]);
    } //
    else if (data.startsWith("analytics_")) {
      const walletAddress = data.replace("analytics_", "");
      await showWalletAnalytics(bot, callbackQuery.message, walletAddress);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error("Error handling callback:", error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Error processing request",
    });
  }
});
console.log("🤖 Telegram Bot is running...");
module.exports = bot;
