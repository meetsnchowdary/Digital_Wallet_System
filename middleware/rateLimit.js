const rateLimitMap = new Map();

module.exports = (req, res, next) => {
  const userId = req.user._id.toString();
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const limit = 10; // 10 requests per minute

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }
  const timestamps = rateLimitMap.get(userId).filter(ts => now - ts < window);
  if (timestamps.length >= limit) {
    return res.status(429).json({ message: 'Too many requests' });
  }
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  next();
};
