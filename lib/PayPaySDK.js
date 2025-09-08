/**
 * PayPaySDK - Main SDK class for PayPay Angola payment integration
 * Provides a unified interface for all PayPay payment operations
 */

const ConfigManager = require('./config/ConfigManager');
const PaymentClient = require('./payment/PaymentClient');
const MulticaixaPayment = require('./payment/MulticaixaPayment');
const PayPayAppPayment = require('./payment/PayPayAppPayment');
const CryptoUtils = require('./crypto/CryptoUtils');
const { getEnvironmentConfig } = require('./config/environments');

/**
 * PayPay SDK - Main class for payment integration
 * 
 * @example
 * const PayPaySDK = require('@paypay-ao/payment-sdk');
 * 
 * const sdk = new PayPaySDK({
 *   partnerId: 'YOUR_PARTNER_ID',
 *   privateKey: 'YOUR_PRIVATE_KEY',
 *   paypayPublicKey: 'PAYPAY_PUBLIC_KEY',
 *   environment: 'sandbox'
 * });
 */
class PayPaySDK {
    /**
     * Creates a new PayPay SDK instance
     * @param {Object} config - SDK configuration
     * @param {string} config.partnerId - Merchant partner ID
     * @param {string} config.privateKey - RSA private key in PEM format
     * @param {string} config.paypayPublicKey - PayPay public key in PEM format
     * @param {string} [config.environment='production'] - Environment (sandbox/production)
     * @param {string} [config.language='pt'] - Language preference (pt/en)
     * @param {string} [config.saleProductCode] - Sale product code
     */
    constructor(config) {
        // Initialize configuration manager
        this.configManager = new ConfigManager(config);

        // Get validated configuration
        this.config = this.configManager.getConfig();

        // Initialize payment clients
        this.paymentClient = new PaymentClient(this.config);
        this.multicaixaPayment = new MulticaixaPayment(this.config);
        this.paypayAppPayment = new PayPayAppPayment(this.config);

        // SDK metadata
        this.version = '1.0.0';
        this.name = 'PayPay AO SDK';
    }

    /**
     * Creates a MULTICAIXA Express payment
     * @param {Object} orderDetails - Order details
     * @param {string} orderDetails.outTradeNo - Unique trade number
     * @param {number} orderDetails.amount - Payment amount in AOA
     * @param {string} orderDetails.phoneNum - Customer phone number (244XXXXXXXXX)
     * @param {string} [orderDetails.paymentMethod='EXPRESS'] - Payment method (EXPRESS/REFERENCE)
     * @param {string} [orderDetails.subject='Purchase'] - Payment description
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.clientIp] - Client IP address
     * @returns {Promise<Object>} Payment response
     * 
     * @example
     * const payment = await sdk.createMulticaixaPayment({
     *   outTradeNo: 'ORDER_123',
     *   amount: 1000.50,
     *   phoneNum: '244900123456',
     *   paymentMethod: 'EXPRESS',
     *   subject: 'Product purchase'
     * });
     */
    async createMulticaixaPayment(orderDetails, options = {}) {
        this.validateOrderDetails(orderDetails, 'multicaixa');
        return await this.multicaixaPayment.createMulticaixaPayment(orderDetails, options);
    }

    /**
     * Creates a PayPay App payment
     * @param {Object} orderDetails - Order details
     * @param {string} orderDetails.outTradeNo - Unique trade number
     * @param {number} orderDetails.amount - Payment amount in AOA
     * @param {string} [orderDetails.subject='Purchase'] - Payment description
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.clientIp] - Client IP address
     * @returns {Promise<Object>} Payment response with dynamic link
     * 
     * @example
     * const payment = await sdk.createPayPayAppPayment({
     *   outTradeNo: 'ORDER_124',
     *   amount: 2500.00,
     *   subject: 'Service payment'
     * });
     */
    async createPayPayAppPayment(orderDetails, options = {}) {
        this.validateOrderDetails(orderDetails, 'paypay_app');
        return await this.paypayAppPayment.createPayPayAppPayment(orderDetails, options);
    }

    /**
     * Query payment order status
     * @param {string} outTradeNo - Order details
     * @returns {Promise<Object>} Query response
     */
    async queryPaymentOrderStatus(outTradeNo) {
        return await this.paymentClient.queryPaymentOrderStatus(outTradeNo)
    }

    /**
     * Creates an EXPRESS MULTICAIXA payment (shorthand method)
     * @param {Object} orderDetails - Order details
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Payment response
     */
    async createExpressPayment(orderDetails, options = {}) {
        const paymentData = { ...orderDetails, paymentMethod: 'EXPRESS' };
        return await this.createMulticaixaPayment(paymentData, options);
    }

    /**
     * Creates a REFERENCE MULTICAIXA payment (shorthand method)
     * @param {Object} orderDetails - Order details (without phoneNum)
     * @param {Object} [options={}] - Additional options
     * @returns {Promise<Object>} Payment response with reference details
     */
    async createReferencePayment(orderDetails, options = {}) {
        const paymentData = {
            ...orderDetails,
            paymentMethod: 'REFERENCE',
            phoneNum: 'N/A' // Reference payments don't require phone
        };
        return await this.createMulticaixaPayment(paymentData, options);
    }

    /**
     * Validates configuration without throwing errors
     * @returns {Object} Validation result
     */
    validateConfig() {
        try {
            this.configManager.validate();
            return {
                isValid: true,
                errors: []
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Gets SDK configuration (sanitized for security)
     * @returns {Object} Sanitized configuration
     */
    getConfig() {
        const config = this.configManager.getConfig();
        return {
            partnerId: config.partnerId,
            environment: config.environment,
            language: config.language,
            apiUrl: config.apiUrl,
            saleProductCode: config.saleProductCode,
            version: this.version
        };
    }

    /**
     * Updates SDK configuration
     * @param {Object} newConfig - New configuration values
     */
    updateConfig(newConfig) {
        Object.keys(newConfig).forEach(key => {
            this.configManager.set(key, newConfig[key]);
        });

        // Update internal clients with new config
        this.config = this.configManager.getConfig();
        this.paymentClient = new PaymentClient(this.config);
        this.multicaixaPayment = new MulticaixaPayment(this.config);
        this.paypayAppPayment = new PayPayAppPayment(this.config);
    }

    /**
     * Checks if SDK is in sandbox mode
     * @returns {boolean} True if sandbox environment
     */
    isSandbox() {
        return this.configManager.isSandbox();
    }

    /**
     * Checks if SDK is in production mode
     * @returns {boolean} True if production environment
     */
    isProduction() {
        return this.configManager.isProduction();
    }

    /**
     * Gets environment information
     * @returns {Object} Environment details
     */
    getEnvironmentInfo() {
        return getEnvironmentConfig(this.config.environment);
    }

    /**
     * Generates a unique trade number
     * @param {string} [prefix=''] - Optional prefix for trade number
     * @returns {string} Unique trade number
     */
    generateTradeNumber(prefix = '') {
        const timestamp = Date.now();
        const random = CryptoUtils.generateRandomString(8);
        return `${prefix}${timestamp}_${random}`;
    }

    /**
     * Validates payment amount
     * @param {number} amount - Amount to validate
     * @returns {Object} Validation result
     */
    validateAmount(amount) {
        return PayPayAppPayment.validateAmount(amount);
    }

    /**
     * Validates phone number for MULTICAIXA
     * @param {string} phoneNum - Phone number to validate
     * @returns {boolean} True if valid
     */
    validatePhoneNumber(phoneNum) {
        return MulticaixaPayment.validatePhoneNumber(phoneNum);
    }

    /**
     * Formats phone number for MULTICAIXA
     * @param {string} phoneNum - Phone number to format
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phoneNum) {
        return MulticaixaPayment.formatPhoneNumber(phoneNum);
    }

    /**
     * Gets supported payment methods
     * @returns {Object} Supported methods by type
     */
    getSupportedMethods() {
        return {
            multicaixa: MulticaixaPayment.getSupportedMethods(),
            paypayApp: ['APP_PAYMENT'],
            currencies: PayPayAppPayment.getSupportedCurrencies()
        };
    }

    /**
     * Gets SDK version and information
     * @returns {Object} SDK information
     */
    getSDKInfo() {
        return {
            name: this.name,
            version: this.version,
            environment: this.config.environment,
            supportedMethods: this.getSupportedMethods(),
            author: 'PayPay Angola',
            documentation: 'https://developer.paypay.ao'
        };
    }

    /**
     * Validates order details based on payment type
     * @private
     */
    validateOrderDetails(orderDetails, paymentType) {
        if (!orderDetails.outTradeNo || !orderDetails.amount) {
            throw new Error('outTradeNo and amount are required');
        }

        if (paymentType === 'multicaixa' && orderDetails.paymentMethod === 'EXPRESS' && !orderDetails.phoneNum) {
            throw new Error('phoneNum is required for MULTICAIXA EXPRESS payments');
        }

        const amountValidation = this.validateAmount(orderDetails.amount);
        if (!amountValidation.isValid) {
            throw new Error(`Invalid amount: ${amountValidation.errors.join(', ')}`);
        }
    }

    /**
     * Cleanup method for graceful shutdown
     */
    destroy() {
        // Clear any sensitive data
        if (this.paymentClient && this.paymentClient.rsaManager) {
            this.paymentClient.rsaManager.clearKeys();
        }

        // Reset references
        this.configManager = null;
        this.paymentClient = null;
        this.multicaixaPayment = null;
        this.paypayAppPayment = null;
    }
}

module.exports = PayPaySDK;