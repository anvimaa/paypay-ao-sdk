/**
 * MulticaixaPayment - Specialized handler for MULTICAIXA Express payments
 * Provides focused functionality for MULTICAIXA payment processing
 */

const PaymentClient = require('./PaymentClient');

/**
 * MULTICAIXA Express payment handler
 * Extends PaymentClient with MULTICAIXA-specific functionality
 */
class MulticaixaPayment extends PaymentClient {
    constructor(config) {
        super(config);
        this.paymentType = 'MULTICAIXA';
    }

    /**
     * Creates an EXPRESS payment (immediate phone-based payment)
     * @param {Object} orderDetails - Order details
     * @param {string} orderDetails.outTradeNo - Unique trade number
     * @param {number} orderDetails.amount - Payment amount
     * @param {string} orderDetails.phoneNum - Customer phone number
     * @param {string} [orderDetails.subject] - Payment description
     * @param {Object} [options] - Additional options
     * @returns {Promise<Object>} Payment response
     */
    async createExpressPayment(orderDetails, options = {}) {
        const paymentData = {
            ...orderDetails,
            paymentMethod: 'EXPRESS'
        };
        
        return await this.createMulticaixaPayment(paymentData, options);
    }

    /**
     * Creates a REFERENCE payment (reference-based payment)
     * @param {Object} orderDetails - Order details
     * @param {string} orderDetails.outTradeNo - Unique trade number
     * @param {number} orderDetails.amount - Payment amount
     * @param {string} [orderDetails.subject] - Payment description
     * @param {Object} [options] - Additional options
     * @returns {Promise<Object>} Payment response with reference details
     */
    async createReferencePayment(orderDetails, options = {}) {
        const paymentData = {
            ...orderDetails,
            paymentMethod: 'REFERENCE',
            phoneNum: 'N/A' // Reference payments don't require phone number
        };
        
        return await this.createMulticaixaPayment(paymentData, options);
    }

    /**
     * Validates phone number format for MULTICAIXA
     * @param {string} phoneNum - Phone number to validate
     * @returns {boolean} True if valid
     */
    static validatePhoneNumber(phoneNum) {
        // Angola phone number validation (basic)
        const phoneRegex = /^244[0-9]{9}$/;
        return phoneRegex.test(phoneNum.replace(/\s+/g, ''));
    }

    /**
     * Formats phone number for MULTICAIXA
     * @param {string} phoneNum - Phone number to format
     * @returns {string} Formatted phone number
     */
    static formatPhoneNumber(phoneNum) {
        // Remove spaces and ensure 244 prefix
        const cleaned = phoneNum.replace(/\s+/g, '');
        if (cleaned.startsWith('244')) {
            return cleaned;
        } else if (cleaned.startsWith('9')) {
            return '244' + cleaned;
        }
        return cleaned;
    }

    /**
     * Gets supported payment methods for MULTICAIXA
     * @returns {string[]} Array of supported methods
     */
    static getSupportedMethods() {
        return ['EXPRESS', 'REFERENCE'];
    }

    /**
     * Gets payment method requirements
     * @param {string} method - Payment method
     * @returns {Object} Requirements object
     */
    static getMethodRequirements(method) {
        const requirements = {
            EXPRESS: {
                phoneNumber: true,
                immediateProcessing: true,
                referenceGeneration: false,
                description: 'Immediate payment processing via phone number'
            },
            REFERENCE: {
                phoneNumber: false,
                immediateProcessing: false,
                referenceGeneration: true,
                description: 'Reference-based payment for later processing'
            }
        };
        
        return requirements[method.toUpperCase()] || null;
    }
}

module.exports = MulticaixaPayment;