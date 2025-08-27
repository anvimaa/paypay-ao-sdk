/**
 * PayPay AO SDK - Main Application File
 * Modular Express.js application for PayPay Angola payment integration
 */

const express = require("express");
const cors = require("cors");

// Import configuration
const config = require("./config");

// Import middleware
const { errorHandler, requestLogger, validateRequest } = require("./middleware");

// Import routes
const generalRoutes = require("./routes/index");
const paymentRoutes = require("./routes/paymentRoutes");



// Initialize Express application
const app = express();

// Apply middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Log all requests
app.use(validateRequest); // Validate common request parameters

// Apply routes
app.use("/", generalRoutes); // General routes (health check, etc.)
app.use("/api", paymentRoutes); // Payment-related routes

// Apply error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start the Express server
 */
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 PayPay AO SDK Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`💳 Payment API available at: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
