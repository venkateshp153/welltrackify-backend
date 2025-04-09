// src/middlewares/validateRequest.js
import ApiError from '../utils/apiError.js';
import logger from '../config/logger.js';

/**
 * Middleware to validate request data against a Joi schema
 * @param {Joi.Schema} schema - The Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => (req, res, next) => {
  try {
    // Validate the request against the schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      allowUnknown: true, // Allow unknown properties that aren't in the schema
    });

    if (error) {
      // Format Joi validation errors
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      logger.warn('Validation error:', { errors });
      throw new ApiError(400, 'Validation failed', false, { errors });
    }

    // Replace req.body with the validated value
    req.body = value;
    next();
  } catch (error) {
    next(error);
  }
};

// Export as default export
export default validateRequest;