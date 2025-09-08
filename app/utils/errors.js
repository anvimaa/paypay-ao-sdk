/**
 * Error classes for PayPay SDK
 * Provides structured error handling with specific error types
 */

/**
 * Base PayPay SDK error class
 */
class PayPayError extends Error {
    constructor(message, code = 'PAYPAY_ERROR', details = {}) {
        super(message);
        this.name = 'PayPayError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        
        // Maintain proper stack trace for V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PayPayError);
        }
    }

    /**
     * Convert error to JSON for logging/debugging
     * @returns {Object} JSON representation of error
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * Configuration related errors
 */
class PayPayConfigError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'PayPayConfigError';
    }
}

/**
 * Payment processing errors
 */
class PayPayPaymentError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'PAYMENT_ERROR', details);
        this.name = 'PayPayPaymentError';
    }
}

/**
 * Cryptographic operation errors
 */
class PayPayCryptoError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'CRYPTO_ERROR', details);
        this.name = 'PayPayCryptoError';
    }
}

/**
 * Network/API communication errors
 */
class PayPayNetworkError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'PayPayNetworkError';
    }
}

/**
 * Validation errors
 */
class PayPayValidationError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'PayPayValidationError';
    }
}

/**
 * Authentication/authorization errors
 */
class PayPayAuthError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'AUTH_ERROR', details);
        this.name = 'PayPayAuthError';
    }
}

/**
 * Rate limiting errors
 */
class PayPayRateLimitError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'RATE_LIMIT_ERROR', details);
        this.name = 'PayPayRateLimitError';
    }
}

/**
 * Service unavailable errors
 */
class PayPayServiceError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'SERVICE_ERROR', details);
        this.name = 'PayPayServiceError';
    }
}

/**
 * Error factory for creating appropriate error types
 */
class ErrorFactory {
    /**
     * Creates an error based on API response
     * @param {Object} response - API response object
     * @param {string} operation - Operation that failed
     * @returns {PayPayError} Appropriate error instance
     */
    static fromApiResponse(response, operation = 'API operation') {
        const errorCode = response.error_code || response.code;
        const message = response.sub_msg || response.error_msg || response.message || 'Unknown error';
        
        const details = {
            operation,
            apiResponse: response,
            errorCode,
            subCode: response.sub_code
        };

        // Map error codes to appropriate error types
        switch (errorCode) {
            case 'INVALID_PARAMETER':
            case 'MISSING_PARAMETER':
                return new PayPayValidationError(message, details);
                
            case 'INVALID_SIGNATURE':
            case 'SIGNATURE_ERROR':
                return new PayPayCryptoError(message, details);
                
            case 'UNAUTHORIZED':
            case 'FORBIDDEN':
                return new PayPayAuthError(message, details);
                
            case 'RATE_LIMIT_EXCEEDED':
                return new PayPayRateLimitError(message, details);
                
            case 'SERVICE_UNAVAILABLE':
            case 'INTERNAL_ERROR':
                return new PayPayServiceError(message, details);
                
            case 'PAYMENT_FAILED':
            case 'INSUFFICIENT_FUNDS':
                return new PayPayPaymentError(message, details);
                
            default:
                return new PayPayError(message, errorCode, details);
        }
    }

    /**
     * Creates a network error
     * @param {Error} originalError - Original network error
     * @param {string} operation - Operation that failed
     * @returns {PayPayNetworkError} Network error instance
     */
    static fromNetworkError(originalError, operation = 'Network operation') {
        const details = {
            operation,
            originalError: originalError.message,
            code: originalError.code,
            errno: originalError.errno,
            syscall: originalError.syscall
        };

        let message = `${operation} failed: `;
        
        if (originalError.code === 'ENOTFOUND') {
            message += 'Unable to resolve hostname';
        } else if (originalError.code === 'ECONNREFUSED') {
            message += 'Connection refused';
        } else if (originalError.code === 'ETIMEDOUT') {
            message += 'Request timeout';
        } else {
            message += originalError.message;
        }

        return new PayPayNetworkError(message, details);
    }

    /**
     * Creates a validation error from validation results
     * @param {Array} validationErrors - Array of validation error messages
     * @param {string} field - Field that failed validation
     * @returns {PayPayValidationError} Validation error instance
     */
    static fromValidationErrors(validationErrors, field = 'input') {
        const message = `Validation failed for ${field}: ${validationErrors.join(', ')}`;
        const details = {
            field,
            validationErrors
        };

        return new PayPayValidationError(message, details);
    }
}

/**
 * Error handler utility
 */
class ErrorHandler {
    /**
     * Handles and logs errors appropriately
     * @param {Error} error - Error to handle
     * @param {Object} [context={}] - Additional context
     */
    static handle(error, context = {}) {
        const errorInfo = {
            error: error instanceof PayPayError ? error.toJSON() : {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            timestamp: new Date().toISOString()
        };

        // Log error (you can customize this based on your logging needs)
        console.error('PayPay SDK Error:', JSON.stringify(errorInfo, null, 2));

        // You can add additional error handling logic here
        // Such as sending to error tracking service, etc.
    }

    /**
     * Determines if error is retryable
     * @param {Error} error - Error to check
     * @returns {boolean} True if error is retryable
     */
    static isRetryable(error) {
        if (!(error instanceof PayPayError)) {
            return false;
        }

        // Network errors and service errors are typically retryable
        return error instanceof PayPayNetworkError || 
               error instanceof PayPayServiceError ||
               error.code === 'RATE_LIMIT_ERROR';
    }

    /**
     * Gets retry delay for retryable errors
     * @param {Error} error - Error to get delay for
     * @param {number} attemptNumber - Current attempt number
     * @returns {number} Delay in milliseconds
     */
    static getRetryDelay(error, attemptNumber = 1) {
        if (!this.isRetryable(error)) {
            return 0;
        }

        // Exponential backoff with jitter
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds
        
        let delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
        
        // Add jitter (±25%)
        const jitter = delay * 0.25 * (Math.random() - 0.5);
        delay += jitter;
        
        return Math.round(delay);
    }
}

module.exports = {
    PayPayError,
    PayPayConfigError,
    PayPayPaymentError,
    PayPayCryptoError,
    PayPayNetworkError,
    PayPayValidationError,
    PayPayAuthError,
    PayPayRateLimitError,
    PayPayServiceError,
    ErrorFactory,
    ErrorHandler
};