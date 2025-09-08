/**
 * Validators - Input validation utilities for PayPay SDK
 * Provides comprehensive validation functions for payment data
 */

const validator = require('validator');

/**
 * Validation utilities for PayPay SDK
 */
class Validators {
    /**
     * Validates Angola phone number format
     * @param {string} phoneNum - Phone number to validate
     * @returns {Object} Validation result
     */
    static validateAngolaPhoneNumber(phoneNum) {
        const result = {
            isValid: false,
            formatted: null,
            errors: []
        };

        if (!phoneNum || typeof phoneNum !== 'string') {
            result.errors.push('Phone number is required and must be a string');
            return result;
        }

        // Clean phone number
        const cleaned = phoneNum.replace(/[\s\-\(\)]/g, '');
        
        // Angola phone number patterns
        const patterns = [
            /^244[9][0-9]{8}$/, // 244 + 9XXXXXXXX (mobile)
            /^244[2][0-9]{7}$/, // 244 + 2XXXXXXX (landline)
            /^9[0-9]{8}$/       // 9XXXXXXXX (mobile without country code)
        ];

        let isValid = false;
        let formatted = cleaned;

        for (const pattern of patterns) {
            if (pattern.test(cleaned)) {
                isValid = true;
                // Ensure 244 prefix for all valid numbers
                if (cleaned.startsWith('9')) {
                    formatted = '244' + cleaned;
                } else {
                    formatted = cleaned;
                }
                break;
            }
        }

        if (!isValid) {
            result.errors.push('Invalid Angola phone number format. Expected: 244XXXXXXXXX or 9XXXXXXXX');
        } else {
            result.isValid = true;
            result.formatted = formatted;
        }

        return result;
    }

    /**
     * Validates payment amount
     * @param {number} amount - Amount to validate
     * @param {Object} [options={}] - Validation options
     * @returns {Object} Validation result
     */
    static validateAmount(amount, options = {}) {
        const {
            minAmount = 100,
            maxAmount = 10000000,
            currency = 'AOA'
        } = options;

        const result = {
            isValid: false,
            formatted: null,
            errors: []
        };

        if (amount === null || amount === undefined) {
            result.errors.push('Amount is required');
            return result;
        }

        if (typeof amount !== 'number') {
            result.errors.push('Amount must be a number');
            return result;
        }

        if (isNaN(amount) || !isFinite(amount)) {
            result.errors.push('Amount must be a valid number');
            return result;
        }

        if (amount <= 0) {
            result.errors.push('Amount must be greater than zero');
            return result;
        }

        if (amount < minAmount) {
            result.errors.push(`Amount must be at least ${minAmount} ${currency}`);
            return result;
        }

        if (amount > maxAmount) {
            result.errors.push(`Amount cannot exceed ${maxAmount} ${currency}`);
            return result;
        }

        // Validate decimal places (max 2 for currency)
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            result.errors.push('Amount cannot have more than 2 decimal places');
            return result;
        }

        result.isValid = true;
        result.formatted = parseFloat(amount.toFixed(2));

        return result;
    }

    /**
     * Validates trade number format
     * @param {string} tradeNo - Trade number to validate
     * @returns {Object} Validation result
     */
    static validateTradeNumber(tradeNo) {
        const result = {
            isValid: false,
            errors: []
        };

        if (!tradeNo || typeof tradeNo !== 'string') {
            result.errors.push('Trade number is required and must be a string');
            return result;
        }

        if (tradeNo.length < 1 || tradeNo.length > 64) {
            result.errors.push('Trade number must be between 1 and 64 characters');
            return result;
        }

        // Allow alphanumeric, dash, underscore
        if (!/^[a-zA-Z0-9\-_]+$/.test(tradeNo)) {
            result.errors.push('Trade number can only contain letters, numbers, dashes, and underscores');
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates email address
     * @param {string} email - Email to validate
     * @returns {Object} Validation result
     */
    static validateEmail(email) {
        const result = {
            isValid: false,
            errors: []
        };

        if (!email || typeof email !== 'string') {
            result.errors.push('Email is required and must be a string');
            return result;
        }

        if (!validator.isEmail(email)) {
            result.errors.push('Invalid email format');
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates IP address
     * @param {string} ip - IP address to validate
     * @returns {Object} Validation result
     */
    static validateIP(ip) {
        const result = {
            isValid: false,
            errors: []
        };

        if (!ip || typeof ip !== 'string') {
            result.errors.push('IP address is required and must be a string');
            return result;
        }

        if (!validator.isIP(ip)) {
            result.errors.push('Invalid IP address format');
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates URL format
     * @param {string} url - URL to validate
     * @returns {Object} Validation result
     */
    static validateURL(url) {
        const result = {
            isValid: false,
            errors: []
        };

        if (!url || typeof url !== 'string') {
            result.errors.push('URL is required and must be a string');
            return result;
        }

        if (!validator.isURL(url, { protocols: ['http', 'https'] })) {
            result.errors.push('Invalid URL format');
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates payment subject/description
     * @param {string} subject - Subject to validate
     * @returns {Object} Validation result
     */
    static validateSubject(subject) {
        const result = {
            isValid: false,
            errors: []
        };

        if (!subject || typeof subject !== 'string') {
            result.errors.push('Subject is required and must be a string');
            return result;
        }

        if (subject.trim().length === 0) {
            result.errors.push('Subject cannot be empty');
            return result;
        }

        if (subject.length > 128) {
            result.errors.push('Subject cannot exceed 128 characters');
            return result;
        }

        // Remove dangerous characters
        const sanitized = subject.replace(/[<>'"&]/g, '');
        if (sanitized !== subject) {
            result.errors.push('Subject contains invalid characters');
            return result;
        }

        result.isValid = true;
        return result;
    }

    /**
     * Validates complete order details
     * @param {Object} orderDetails - Order details to validate
     * @param {string} paymentType - Type of payment (multicaixa/paypay_app)
     * @returns {Object} Validation result
     */
    static validateOrderDetails(orderDetails, paymentType = 'multicaixa') {
        const result = {
            isValid: true,
            errors: [],
            validatedData: {}
        };

        if (!orderDetails || typeof orderDetails !== 'object') {
            result.isValid = false;
            result.errors.push('Order details are required and must be an object');
            return result;
        }

        // Validate trade number
        const tradeValidation = this.validateTradeNumber(orderDetails.outTradeNo);
        if (!tradeValidation.isValid) {
            result.isValid = false;
            result.errors.push(...tradeValidation.errors);
        } else {
            result.validatedData.outTradeNo = orderDetails.outTradeNo;
        }

        // Validate amount
        const amountValidation = this.validateAmount(orderDetails.amount);
        if (!amountValidation.isValid) {
            result.isValid = false;
            result.errors.push(...amountValidation.errors);
        } else {
            result.validatedData.amount = amountValidation.formatted;
        }

        // Validate subject if provided
        if (orderDetails.subject) {
            const subjectValidation = this.validateSubject(orderDetails.subject);
            if (!subjectValidation.isValid) {
                result.isValid = false;
                result.errors.push(...subjectValidation.errors);
            } else {
                result.validatedData.subject = orderDetails.subject;
            }
        }

        // Payment type specific validations
        if (paymentType === 'multicaixa' && orderDetails.paymentMethod === 'EXPRESS') {
            const phoneValidation = this.validateAngolaPhoneNumber(orderDetails.phoneNum);
            if (!phoneValidation.isValid) {
                result.isValid = false;
                result.errors.push(...phoneValidation.errors);
            } else {
                result.validatedData.phoneNum = phoneValidation.formatted;
            }

            result.validatedData.paymentMethod = orderDetails.paymentMethod;
        }

        return result;
    }
}

module.exports = Validators;