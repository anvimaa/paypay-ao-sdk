/**
 * Services module index
 * Exports all service functions
 */

const paymentService = require('./paymentService');

module.exports = {
    ...paymentService,
};