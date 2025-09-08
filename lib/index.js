/**
 * PayPay AO SDK - Main entry point
 * Official SDK for PayPay Angola payment integration
 * 
 * @author PayPay Angola
 * @version 1.0.0
 * @license MIT
 */

const PayPaySDK = require('./PayPaySDK');
const ConfigManager = require('./config/ConfigManager');
const CryptoUtils = require('./crypto/CryptoUtils');
const RSAManager = require('./crypto/RSAManager');
const PaymentClient = require('./payment/PaymentClient');
const MulticaixaPayment = require('./payment/MulticaixaPayment');
const PayPayAppPayment = require('./payment/PayPayAppPayment');
const { environments, getEnvironmentConfig } = require('./config/environments');

// Error classes for better error handling
class PayPayError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'PayPayError';
        this.code = code;
        this.details = details;
    }
}

class PayPayConfigError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'PayPayConfigError';
    }
}

class PayPayPaymentError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'PAYMENT_ERROR', details);
        this.name = 'PayPayPaymentError';
    }
}

class PayPayCryptoError extends PayPayError {
    constructor(message, details = {}) {
        super(message, 'CRYPTO_ERROR', details);
        this.name = 'PayPayCryptoError';
    }
}

// SDK Factory function for easier instantiation
function createPayPaySDK(config) {
    try {
        return new PayPaySDK(config);
    } catch (error) {
        throw new PayPayConfigError(`Failed to create PayPay SDK: ${error.message}`, {
            originalError: error,
            config: config ? Object.keys(config) : []
        });
    }
}

// Version information
const version = '1.0.0';
const name = 'PayPay AO SDK';

// Export main SDK class as default
module.exports = PayPaySDK;

// Named exports for advanced usage
module.exports.PayPaySDK = PayPaySDK;
module.exports.createPayPaySDK = createPayPaySDK;

// Configuration utilities
module.exports.ConfigManager = ConfigManager;
module.exports.environments = environments;
module.exports.getEnvironmentConfig = getEnvironmentConfig;

// Cryptographic utilities
module.exports.CryptoUtils = CryptoUtils;
module.exports.RSAManager = RSAManager;

// Payment components
module.exports.PaymentClient = PaymentClient;
module.exports.MulticaixaPayment = MulticaixaPayment;
module.exports.PayPayAppPayment = PayPayAppPayment;

// Error classes
module.exports.PayPayError = PayPayError;
module.exports.PayPayConfigError = PayPayConfigError;
module.exports.PayPayPaymentError = PayPayPaymentError;
module.exports.PayPayCryptoError = PayPayCryptoError;

// SDK metadata
module.exports.version = version;
module.exports.name = name;

// Utility functions
module.exports.utils = {
    generateTradeNumber: (prefix = '') => {
        const timestamp = Date.now();
        const random = CryptoUtils.generateRandomString(8);
        return `${prefix}${timestamp}_${random}`;
    },
    
    validatePhoneNumber: (phoneNum) => {
        return MulticaixaPayment.validatePhoneNumber(phoneNum);
    },
    
    formatPhoneNumber: (phoneNum) => {
        return MulticaixaPayment.formatPhoneNumber(phoneNum);
    },
    
    validateAmount: (amount) => {
        return PayPayAppPayment.validateAmount(amount);
    },
    
    getSupportedMethods: () => {
        return {
            multicaixa: MulticaixaPayment.getSupportedMethods(),
            paypayApp: ['APP_PAYMENT'],
            currencies: PayPayAppPayment.getSupportedCurrencies()
        };
    }
};

// Constants
module.exports.constants = {
    ENVIRONMENTS: Object.keys(environments),
    PAYMENT_METHODS: {
        MULTICAIXA: {
            EXPRESS: 'EXPRESS',
            REFERENCE: 'REFERENCE'
        },
        PAYPAY_APP: 'APP_PAYMENT'
    },
    CURRENCIES: ['AOA'],
    TIMEOUT: {
        DEFAULT: '15m',
        MAXIMUM: '30m',
        MINIMUM: '5m'
    }
};

// Quick start helper
module.exports.quickStart = {
    createSandboxSDK: (partnerId, privateKey, paypayPublicKey) => {
        return new PayPaySDK({
            partnerId,
            privateKey,
            paypayPublicKey,
            environment: 'sandbox',
            language: 'pt'
        });
    },
    
    createProductionSDK: (partnerId, privateKey, paypayPublicKey) => {
        return new PayPaySDK({
            partnerId,
            privateKey,
            paypayPublicKey,
            environment: 'production',
            language: 'pt'
        });
    }
};

// Documentation links
module.exports.docs = {
    apiReference: 'https://developer.paypay.ao/api',
    gettingStarted: 'https://developer.paypay.ao/docs/getting-started',
    examples: 'https://developer.paypay.ao/docs/examples',
    support: 'https://support.paypay.ao'
};