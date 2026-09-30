require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const bot = require("./bot/bot");
const walletRoutes = require("./routes/walletRoutes");


const app = express();
connectDB();

app.use("/api/wallet", walletRoutes);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
