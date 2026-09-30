const mongoose = require("mongoose");

const TrackedWalletSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  lastTxHash: { type: String, default: null },
});

module.exports = mongoose.model("TrackedWallet", TrackedWalletSchema);
