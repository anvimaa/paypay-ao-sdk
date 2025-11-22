
/**
 * Middleware module for PayPay AO SDK
 * Contains common middleware functions for request processing
 */

/**
 * Error handling middleware
 * Handles errors that occur during request processing
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
    console.error("Error occurred:", err);

    // Handle different types of errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            details: err.message
        });
    }

    if (err.name === "UnauthorizedError") {
        return res.status(401).json({
            success: false,
            error: "Unauthorized access"
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
    });
}

/**
 * Request logging middleware
 * Logs incoming requests for debugging and monitoring
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function requestLogger(req, res, next) {
    const ip = await require('paypay-ao-sdk').getIp() || "192.168.2.1"
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${ip}`);
    next();
}

/**
 * Request validation middleware
 * Validates common request parameters
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
function validateRequest(req, res, next) {
    // Add common validation logic here
    if (req.method === "POST" && !req.headers["content-type"]?.includes("application/json")) {
        return res.status(400).json({
            success: false,
            error: "Content-Type must be application/json for POST requests"
        });
    }
    next();
}

module.exports = {
    errorHandler,
    requestLogger,
    validateRequest,
};