const REQUIRED_VARS = ["JWT_SECRET"];

const INSECURE_SECRETS = ["your-super-secret-jwt-key-change-this-in-production"];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Please define them in your .env file."
    );
  }

  if (process.env.NODE_ENV === "production" && INSECURE_SECRETS.includes(process.env.JWT_SECRET)) {
    throw new Error(
      "JWT_SECRET is using a default insecure value. Set a strong, unique secret before running in production."
    );
  }

  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    corsOrigin: process.env.CORS_ORIGIN || "*",
  };
};

module.exports = { validateEnv };
