// utils/logger.js
const fs = require("fs");

function log(message) {
  fs.appendFileSync(
    "logs/bot.log",
    `${new Date().toISOString()} - ${message}\n`
  );
}

module.exports = { log };
