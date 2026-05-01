/**
 * Input validation utility
 * Provides reusable validation functions
 */

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Field names that must be present
 * @returns {Object} { valid: boolean, missingFields: string[] }
 */
function validateRequired(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field]);
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ID format (should be positive number)
 * @param {*} id - ID to validate
 * @returns {boolean}
 */
function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

/**
 * Validate length of string
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean}
 */
function isValidLength(str, minLength, maxLength) {
  if (typeof str !== 'string') return false;
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Sanitize string input (basic XSS prevention)
 * @param {string} str - String to sanitize
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>\"']/g, '')
    .slice(0, 500); // Limit length
}

/**
 * Validate object contains required fields with correct types
 * @param {Object} obj - Object to validate
 * @param {Object} schema - Schema defining required fields and types
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateSchema(obj, schema) {
  const errors = [];

  Object.keys(schema).forEach(field => {
    const { type, required, min, max } = schema[field];
    const value = obj[field];

    if (required && (value === undefined || value === null)) {
      errors.push(`Field "${field}" is required`);
      return;
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== type) {
        errors.push(`Field "${field}" must be of type ${type}`);
        return;
      }

      if (type === 'string' && (min || max)) {
        if (min && value.length < min) {
          errors.push(`Field "${field}" must be at least ${min} characters`);
        }
        if (max && value.length > max) {
          errors.push(`Field "${field}" must be at most ${max} characters`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRequired,
  isValidEmail,
  isValidId,
  isValidLength,
  sanitizeString,
  validateSchema,
};
