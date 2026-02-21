const { sendError } = require("../utils/apiResponse");

const notFoundHandler = (req, res) => {
  return sendError(res, { message: `Route ${req.method} ${req.originalUrl} not found.`, statusCode: 404 });
};

const globalErrorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  return sendError(res, {
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    statusCode: err.statusCode || 500,
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
