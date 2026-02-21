const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/apiResponse");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, { message: "Access denied. No token provided.", statusCode: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch {
    return sendError(res, { message: "Invalid or expired token.", statusCode: 401 });
  }
};

module.exports = { authenticate };
