const { ethers } = require("ethers");

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);

async function getEthBalance(walletAddress) {
  const balance = await provider.getBalance(walletAddress);
  return ethers.formatEther(balance); // Convert Wei to ETH
}

module.exports = { getEthBalance };
