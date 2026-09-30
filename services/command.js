const { getTransactions, getBalance } = require("../services/etherscan");
const TrackedWallet = require("../models/TrackedWallet");
const Web3 = require("web3");

const handleStart = (bot, msg) => {
  const chatId = msg.chat.id;

  const inlineOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Track Wallet", callback_data: "ask_wallet_address" }],
      ],
    },
  };
  const keyboardOptions = {
    reply_markup: {
      keyboard: [
        ["➕ Add tracker", "❌ Remove tracker"],
        // ["📊 Check Balance", "🧾 Check Address"],
      ],
      resize_keyboard: true,
      one_time_keyboard: false, // keep it open
    },
  };

  // Send welcome message with inline buttons
  bot.sendMessage(
    chatId,
    `Welcome to ShadowBot 🚀  
Track wallet balances, transactions, and more.  

🛠️ *Available Commands:*  
📌 \`/transactions 0xYourWalletAddress\` – View latest transactions  
📌 \`/balance 0xYourWalletAddress\` – Check ETH balance  
📌 \`/track 0xYourWalletAddress\` – Start tracking a wallet  
📌 \`/untrack 0xYourWalletAddress\` – Stop tracking a wallet  

ℹ️ _Send a valid wallet address to get started!_`,
    { parse_mode: "Markdown", reply_markup: inlineOptions.reply_markup }
  );
  bot.sendMessage(chatId, "Choose from the menu below 👇", keyboardOptions);
};

async function handleTransactions(bot, msg, match) {
  const chatId = msg.chat.id;
  const walletAddress = match ? match[1] : null;

  await bot.sendMessage(chatId, "⏳ Fetching latest transactions...");

  try {
    const transactions = await getTransactions(walletAddress);

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(
        chatId,
        "⚠️ No transactions found or invalid address."
      );
      return;
    }

    let message = `📜 *Latest Transactions for*\n\`${walletAddress}\`:\n\n`;
    transactions.forEach((tx, index) => {
      message += `🔹 *${index + 1}. TxHash:* [${tx.hash.substring(
        0,
        12
      )}...](https://etherscan.io/tx/${tx.hash})\n`;
      message += `   💰 *Value:* \`${tx.value} ETH\`\n`;
      message += `   ⛽ *Gas Used:* \`${tx.gasUsed}\`\n`;
      message += `   ⏳ *Time:* \`${new Date(
        tx.timeStamp * 1000
      ).toLocaleString()}\`\n\n`;
    });

    // Handle undefined transactions array
    if (!transactions || !Array.isArray(transactions)) {
      throw new Error("Transactions data is invalid.");
    }
    // Add refresh button
    const txOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔄 Refresh Tx",
              callback_data: `refresh_tx_${walletAddress}`,
            },
            {
              text: "📈 Analytics",
              callback_data: `analytics_${walletAddress}`,
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    };

    await bot.sendMessage(chatId, message, txOptions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    await bot.sendMessage(
      chatId,
      "❌ Error fetching transactions. Try again later."
    );
  }
}

async function showWalletAnalytics(bot, msg, walletAddress) {
  const chatId = msg.chat.id;

  try {
    await bot.sendChatAction(chatId, "typing");

    // Fetch all needed data
    const [transactions, balance] = await Promise.all([
      getTransactions(walletAddress),
      getBalance(walletAddress),
    ]);

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(
        chatId,
        "No transaction history found for analytics."
      );
      return;
    }

    // Calculate analytics
    const analytics = calculateWalletAnalytics(transactions, balance);

    // Format message with markdown
    const message = formatAnalyticsMessage(walletAddress, analytics);

    // Send with action buttons
    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔄 Refresh Stats",
              callback_data: `analytics_${walletAddress}`,
            },
            {
              text: "📜 View Transactions",
              callback_data: `view_tx_${walletAddress}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    await bot.sendMessage(
      chatId,
      "❌ Error generating analytics. Try again later."
    );
  }
}

function calculateWalletAnalytics(transactions, balanceWei) {
  const balanceEth = Web3.utils.fromWei(balanceWei, "ether");
  const now = new Date();
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

  // Transaction stats
  const totalTx = transactions.length;
  const incomingTx = transactions.filter((tx) => tx.isReceived).length;
  const outgoingTx = totalTx - incomingTx;

  // Value stats
  const totalReceived = transactions
    .filter((tx) => tx.isReceived)
    .reduce((sum, tx) => sum + parseFloat(tx.value), 0);

  const totalSent = transactions
    .filter((tx) => !tx.isReceived)
    .reduce((sum, tx) => sum + parseFloat(tx.value), 0);

  // Time-based stats
  const recentTx = transactions.filter(
    (tx) => new Date(tx.timeStamp * 1000) > oneMonthAgo
  ).length;

  return {
    balance: parseFloat(balanceEth).toFixed(4),
    totalTx,
    incomingTx,
    outgoingTx,
    totalReceived: totalReceived.toFixed(4),
    totalSent: totalSent.toFixed(4),
    netFlow: (totalReceived - totalSent).toFixed(4),
    recentTx,
    txFrequency: totalTx > 0 ? (totalTx / 30).toFixed(1) : 0, // Avg tx per day
  };
}

function formatAnalyticsMessage(walletAddress, analytics) {
  return `
📈 *Wallet Analytics* \n\`${walletAddress}\`

💼 *Current Balance:* \`${analytics.balance} ETH\`
  
📊 *Transaction Stats:*
├ Total: \`${analytics.totalTx}\` 
├ Incoming: \`${analytics.incomingTx}\` 
└ Outgoing: \`${analytics.outgoingTx}\`

💰 *Value Flow:*
├ Received: \`${analytics.totalReceived} ETH\`
├ Sent: \`${analytics.totalSent} ETH\`
└ Net: \`${analytics.netFlow} ETH\`

⏳ *Activity:*
├ Last 30 days: \`${analytics.recentTx} tx\`
└ Avg: \`${analytics.txFrequency} tx/day\`

_Data based on visible Ethereum transactions_`;
}

async function trackWallet(bot, msg, match) {
  const chatId = msg.chat.id;
  const walletAddress = match ? match[1] : null;

  if (!Web3.utils.isAddress(walletAddress)) {
    await bot.sendMessage(chatId, "⚠️ *Invalid Ethereum address format*", {
      parse_mode: "Markdown",
    });
    return;
  }

  try {
    const existing = await TrackedWallet.findOne({ walletAddress, chatId });

    if (existing) {
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
      await bot.sendMessage(
        chatId,
        `⚠️ *This wallet is already being tracked.*`,
        { parse_mode: "Markdown", reply_markup: existingOptions.reply_markup }
      );
      return;
    }

    await TrackedWallet.create({ chatId, walletAddress });
    const txOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📊 Check Balance",
              callback_data: `refresh_balance_${walletAddress}`,
            },
            {
              text: "📜 View Transactions",
              callback_data: `view_tx_${walletAddress}`,
            },
          ],
        ],
      },
    };
    await bot.sendMessage(
      chatId,
      `✅ *Tracking started for wallet:* \n\`${walletAddress}\`\n\n` +
        `_You will be notified for new transactions._`,
      { parse_mode: "Markdown", reply_markup: txOptions.reply_markup }
    );
  } catch (error) {
    console.error("Error tracking wallet:", error);
    await bot.sendMessage(
      chatId,
      "❌ Could not track wallet. Try again later."
    );
  }
}

async function untrackWallet(bot, msg, match) {
  const chatId = msg.chat.id;
  const walletAddress = match ? match[1] : null;

  try {
    const existing = await TrackedWallet.findOneAndDelete({
      walletAddress,
      chatId,
    });

    if (!existing) {
      await bot.sendMessage(
        chatId,
        `⚠️ *This wallet is not currently tracked.*`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    await bot.sendMessage(
      chatId,
      `✅ *Tracking stopped for wallet:* \n\`${walletAddress}\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Error untracking wallet:", error);
    await bot.sendMessage(
      chatId,
      "❌ Failed to untrack wallet. Try again later."
    );
  }
}
async function checkAddress(bot, msg, match) {
  const chatId = msg.chat.id;
  const walletAddress = match ? match[1] : null;
  console.log({ walletAddress });
  await bot.sendMessage(chatId, `Wallet Address: ${walletAddress}`);
}

async function checkBalance(bot, msg, match) {
  const chatId = msg.chat.id;
  const walletAddress = match ? match[1] : null;

  if (!Web3.utils.isAddress(walletAddress)) {
    await bot.sendMessage(chatId, "⚠️ *Invalid Ethereum address format*", {
      parse_mode: "Markdown",
    });
    return;
  }

  await bot.sendMessage(chatId, "⏳ Fetching wallet balance...");

  try {
    const balanceWei = await getBalance(walletAddress);
    const balanceEth = Web3.utils.fromWei(balanceWei, "ether");

    const message =
      `💰 *Wallet Balance*\n\`${walletAddress}\`\n\n` +
      `🔹 *ETH Available:* \`${parseFloat(balanceEth).toFixed(4)} ETH\`\n\n` +
      `_Data fetched in real-time from Ethereum network._`;

    // Add refresh button
    const balanceOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔄 Refresh Balance",
              callback_data: `refresh_balance_${walletAddress}`,
            },
            {
              text: "📜 View Transactions",
              callback_data: `view_tx_${walletAddress}`,
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    };

    await bot.sendMessage(chatId, message, balanceOptions);
  } catch (error) {
    console.error("Error checking balance:", error);
    await bot.sendMessage(
      chatId,
      "❌ Error fetching balance. Try again later."
    );
  }
}

module.exports = {
  handleStart,
  trackWallet,
  untrackWallet,
  handleTransactions,
  checkBalance,
  showWalletAnalytics,
  checkAddress,
};
