const { validationResult } = require('express-validator');
const { ApiError } = require('../lib/response');

/**
 * Runs a set of express-validator chains and converts failures into a 400
 * with a machine-readable `details` array.
 */
function validate(chains) {
  return [
    ...chains,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();

      const details = result.array({ onlyFirstError: true }).map((issue) => ({
        field: issue.path,
        location: issue.location,
        message: issue.msg,
      }));

      return next(ApiError.badRequest('Request validation failed', details));
    },
  ];
}

module.exports = { validate };
