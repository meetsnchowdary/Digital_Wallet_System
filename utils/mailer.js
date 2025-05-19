// Mocked email sender (logs to console)
async function sendMockEmail(to, subject, text) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Text: ${text}`);
  }
  
  module.exports = { sendMockEmail };
  