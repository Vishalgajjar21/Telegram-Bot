// routes/walletRoutes.js
const express = require("express");
const { getEthBalance } = require("../services/blockchain");

const router = express.Router();

router.get("/:wallet", async (req, res) => {
  const balance = await getEthBalance(req.params.wallet);
  res.json({ balance });
});

module.exports = router;
