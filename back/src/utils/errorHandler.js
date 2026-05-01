/**
 * Centralized error handling utility
 * Provides consistent error responses across the application
 */

const ERROR_TYPES = {
  VALIDATION_ERROR: { status: 400, message: 'Validation error' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  CONFLICT: { status: 409, message: 'Resource already exists' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { status: 500, message: 'Database error' },
  EXPIRED: { status: 400, message: 'Resource expired' },
};

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {string} errorType - Type of error (key from ERROR_TYPES)
 * @param {string} customMessage - Optional custom error message
 * @param {Error} error - Optional error object for logging
 */
function sendError(res, errorType = 'INTERNAL_ERROR', customMessage = null, error = null) {
  const errorConfig = ERROR_TYPES[errorType] || ERROR_TYPES.INTERNAL_ERROR;

  if (error) {
    console.error(`[ERROR] ${errorType}:`, error.message);
  }

  return res.status(errorConfig.status).json({
    success: false,
    error: customMessage || errorConfig.message,
    type: errorType,
  });
}

/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data: data || null,
  });
}

/**
 * Wrapper for async route handlers with error handling
 * @param {Function} fn - Async handler function
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      console.error('[Uncaught Handler Error]:', error.message);
      sendError(res, 'INTERNAL_ERROR', null, error);
    });
  };
}

module.exports = {
  sendError,
  sendSuccess,
  asyncHandler,
  ERROR_TYPES,
};
