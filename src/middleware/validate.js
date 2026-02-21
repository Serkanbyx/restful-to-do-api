const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(res, {
      message: "Validation failed.",
      statusCode: 422,
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = { validate };
