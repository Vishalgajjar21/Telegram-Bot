// config/db.js
const mongoose = require("mongoose");
const { monitorTrackedWallets } = require("../services/monitorTransactions");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

module.exports = connectDB;

setInterval(async () => {
  await monitorTrackedWallets();
}, 30000);
  