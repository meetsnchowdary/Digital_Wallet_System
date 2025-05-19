const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendMockEmail } = require('../utils/mailer');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  const suspicious = await Transaction.find({
    $or: [
      { amount: { $gt: 1000 }, type: 'withdraw', isDeleted: false, isFlagged: false },
      // Add more rules as needed
    ]
  });

  for (const tx of suspicious) {
    tx.isFlagged = true;
    tx.status = 'flagged';
    await tx.save();

    // Send mock email to user
    let userId = tx.from || tx.to;
    if (userId) {
      const user = await User.findById(userId);
      if (user && !user.isDeleted) {
        await sendMockEmail(
          user.email,
          'Suspicious Transaction Alert',
          `Transaction ${tx._id} flagged as suspicious in daily scan.`
        );
      }
    }
  }
  console.log(`Daily fraud scan complete. Flagged ${suspicious.length} transactions.`);
});
