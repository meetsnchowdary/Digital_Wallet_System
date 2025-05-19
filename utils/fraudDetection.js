const Transaction = require('../models/Transaction');

async function checkFraud(userId, type, amount, currency) {
  // Rule 1: Multiple transfers in a short period
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentTransfers = await Transaction.countDocuments({
    from: userId,
    type: 'transfer',
    createdAt: { $gte: oneMinuteAgo },
    isDeleted: false
  });

  // Rule 2: Sudden large withdrawal
  const largeWithdrawal = (type === 'withdraw' && amount > 1000); // Example threshold

  let isFlagged = false;
  let reason = null;
  if (recentTransfers > 3) {
    isFlagged = true;
    reason = 'Too many transfers in a short period';
  } else if (largeWithdrawal) {
    isFlagged = true;
    reason = 'Large withdrawal';
  }

  return { isFlagged, reason };
}

module.exports = { checkFraud };
