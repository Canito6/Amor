const ApiError = require('../utils/apiError');

/**
 * Express middleware to validate request using a Zod schema.
 * Supports validating req.body, req.query, or req.params.
 *
 * @param {object} schemas - Object containing schemas for body, query, or params
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const issues = error.issues || [];
        const errorMessages = issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(400, `Erro de validação: ${errorMessages}`));
      }
      next(error);
    }
  };
};

module.exports = validate;
