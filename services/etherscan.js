const axios = require("axios");

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

async function getTransactions(walletAddress) {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
  const response = await axios.get(url);
  return response.data.result.slice(0, 5); // Get latest 5 transactions
}

async function getBalance(walletAddress) {
  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (response.data.status === "1") {
      const balanceInWei = response.data.result;
      const balanceInEth = parseFloat(balanceInWei) / 1e18;
      return balanceInEth;
    } else {
      console.warn("⚠️ Error fetching balance.");
      return 0;
    }
  } catch (error) {
    console.error("❌ Error fetching balance:", error);
    return 0;
  }
}

module.exports = { getTransactions, getBalance };
