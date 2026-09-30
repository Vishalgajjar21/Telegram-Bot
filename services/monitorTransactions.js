const { getTransactions, getBalance } = require("./etherscan");
const TrackedWallet = require("../models/TrackedWallet");
const bot = require("../bot/bot");
const Web3 = require("web3");
const { untrackWallet } = require("./command");

async function monitorTrackedWallets() {
  try {
    const wallets = await TrackedWallet.find();
    
    for (const wallet of wallets) {
      const { walletAddress, chatId, lastTxHash } = wallet;

      const transactions = await getTransactions(walletAddress);
      if (!transactions || transactions.length === 0) continue;

      const latestTx = transactions[0];
      if (latestTx.hash === lastTxHash) continue; // No new transactions

      const ethValue = Web3.utils.fromWei(latestTx.value, "ether");
      const existingOptions = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔍Untrack Wallet",
                callback_data: `untrack-wallet${walletAddress}`,
              },
            ],
          ],
        },
      };

      const message =
        `🚨 *New Transaction Detected!* 🔥\n\n` +
        `🔹 *Wallet:* \`${walletAddress}\`\n\n` +
        `🔹 *Transaction Hash:* [${latestTx.hash}](https://etherscan.io/tx/${latestTx.hash})\n\n` +
        `⬇️ *From:* \`${latestTx.from}\`\n` +
        `⬆️ *To:* \`${latestTx.to}\`\n\n` +
        `💎 *Value:* \`${ethValue} ETH\`\n\n` + // Converted value
        `⛽ *Gas Used:* \`${latestTx.gasUsed}\` @ \`${latestTx.gasPrice} Gwei\`\n\n` +
        `🕒 *Timestamp:* \`${new Date(
          latestTx.timeStamp * 1000
        ).toLocaleString()}\``;

      bot.sendMessage(chatId, message, {
        parse_mode: "Markdown",
        reply_markup: existingOptions.reply_markup,
      });

      // ✅ Update last transaction hash in the database
      await TrackedWallet.updateOne(
        { walletAddress },
        { lastTxHash: latestTx.hash }
      );
    }
  } catch (error) {
    console.error("❌ Error monitoring wallets:", error);
  }
}

module.exports = { monitorTrackedWallets };

bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = msg.chat.id;

  try {
    if (data.startsWith("untrack-wallet")) {
      const walletAddress = data.replace("untrack-wallet", "");

      await untrackWallet(bot, msg, [null, walletAddress]);
    }
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error("Error handling callback:", error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Error processing request",
    });
  }
});
