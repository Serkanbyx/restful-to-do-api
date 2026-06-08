const rateLimit = require("express-rate-limit");

const passThrough = (_req, _res, next) => next();

const buildLimiter = ({ windowMs, max, message }) => {
  if (process.env.NODE_ENV === "test") return passThrough;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ success: false, message });
    },
  });
};

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

const apiLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests. Please try again later.",
});

module.exports = { authLimiter, apiLimiter };
