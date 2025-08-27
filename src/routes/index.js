/**
 * General routes module for PayPay AO SDK
 * Handles general API endpoints like health checks and status
 */

const express = require("express");

const router = express.Router();

/**
 * Route: GET /
 * Health check endpoint
 *
 * @route GET /
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with welcome message.
 */
router.get("/", (req, res) => {
    res.json({
        message: "Hello! PAY PAY API is running!",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

/**
 * Route: GET /health
 * Detailed health check endpoint
 *
 * @route GET /health
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Object} JSON response with health status.
 */
router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "PayPay AO SDK",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;