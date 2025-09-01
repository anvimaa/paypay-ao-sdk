/**
 * PaymentClient - Core payment processing for PayPay SDK
 * Handles MULTICAIXA Express and PayPay App payment creation
 */

const axios = require("axios");
const qs = require("qs");
const CryptoUtils = require("../crypto/CryptoUtils");
const RSAManager = require("../crypto/RSAManager");

/**
 * Payment client for handling PayPay payment operations
 */
class PaymentClient {
    constructor(config) {
        this.config = config;
        this.rsaManager = new RSAManager(config.privateKey, config.paypayPublicKey);
    }

    /**
     * Creates a payment request for MULTICAIXA Express.
     *
     * @async
     * @param {Object} orderDetails - The order details for the payment.
     * @param {string} orderDetails.outTradeNo - Unique external trade number.
     * @param {number} orderDetails.amount - Total amount to be paid.
     * @param {string} orderDetails.phoneNum - Phone number associated with the MULTICAIXA account.
     * @param {string} orderDetails.paymentMethod - Payment method ('EXPRESS' or 'REFERENCE').
     * @param {string} [orderDetails.subject="Purchase"] - Optional description of the transaction.
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.clientIp] - Client IP address
     * @returns {Promise<Object>} Normalized payment response
     * @throws {Error} If the request fails or the API returns an error.
     */
    async createMulticaixaPayment(orderDetails, options = {}) {
        try {
            // Validate input parameters
            this.validateMulticaixaPaymentInput(orderDetails);

            const { outTradeNo, amount, phoneNum, subject = "Purchase", paymentMethod } = orderDetails;
            const { clientIp = "123.25.68.9" } = options;

            // Build payment method configuration
            const payMethod = this.buildMulticaixaPayMethod(amount, paymentMethod, phoneNum);

            // Construct business content
            const bizContent = {
                cashier_type: "SDK",
                payer_ip: clientIp,
                sale_product_code: this.config.saleProductCode,
                timeout_express: "15m",
                trade_info: {
                    currency: "AOA",
                    out_trade_no: outTradeNo,
                    payee_identity: this.config.partnerId,
                    payee_identity_type: "1",
                    price: amount.toFixed(2),
                    quantity: "1",
                    subject,
                    total_amount: amount.toFixed(2),
                },
                pay_method: payMethod,
            };

            // Process payment request
            const response = await this.processPaymentRequest(bizContent);

            // Normalize and return response
            return this.normalizePaymentResponse(response, outTradeNo);

        } catch (error) {
            throw this.handlePaymentError(error, 'createMulticaixaPayment');
        }
    }

    /**
     * Creates a payment request for the PayPay App (non-Multicaixa).
     *
     * @async
     * @param {Object} orderDetails - The order details for the payment.
     * @param {string} orderDetails.outTradeNo - Unique external trade number.
     * @param {number} orderDetails.amount - Total amount to be paid.
     * @param {string} [orderDetails.subject="Purchase"] - Optional description of the transaction.
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.clientIp] - The IP address of the client initiating the transaction.
     * @returns {Promise<Object>} Normalized payment response
     * @throws {Error} If the request fails or the API returns an error.
     */
    async createPayPayAppPayment(orderDetails, options = {}) {
        try {
            // Validate input parameters
            this.validatePayPayAppInput(orderDetails);

            const { outTradeNo, amount, subject = "Purchase" } = orderDetails;
            const { clientIp = "102.140.67.101" } = options;

            // Construct business content (without pay_method for app payments)
            const bizContent = {
                cashier_type: "SDK",
                payer_ip: clientIp,
                sale_product_code: this.config.saleProductCode,
                timeout_express: "15m",
                trade_info: {
                    currency: "AOA",
                    out_trade_no: outTradeNo,
                    payee_identity: this.config.partnerId,
                    payee_identity_type: "1",
                    price: amount.toFixed(2),
                    quantity: "1",
                    subject,
                    total_amount: amount.toFixed(2),
                },
            };

            // Process payment request
            const response = await this.processPaymentRequest(bizContent);

            // Normalize and return response
            return this.normalizePaymentResponse(response, outTradeNo);

        } catch (error) {
            throw this.handlePaymentError(error, 'createPayPayAppPayment');
        }
    }

    /**
     * Query payment order status
     *
     * @async
     * @param {string} outTradeNo - Unique external trade number.
     * @returns {Promise<Object>} Normalized payment response
     * @throws {Error} If the request fails or the API returns an error.
     */
    async queryPaymentOrderStatus(outTradeNo) {
        try {

            // Construct business content (without pay_method for app payments)
            const bizContent = {
                out_trade_no: outTradeNo,
            };

            // Process payment request
            const response = await this.processPaymentRequest(bizContent);

            // Normalize and return response
            return this.normalizePaymentResponse(response, outTradeNo);

        } catch (error) {
            throw this.handlePaymentError(error, 'queryPaymentOrderStatus');
        }
    }

    /**
     * Processes the payment request by encrypting, signing and sending to PayPay API
     * @private
     * @param {Object} bizContent - Business content object
     * @returns {Promise<Object>} Raw API response
     */
    async processPaymentRequest(bizContent) {
        // Encrypt business content
        const encryptedBizContent = this.rsaManager.encryptWithPrivateKey(
            JSON.stringify(bizContent)
        );

        // Prepare request parameters
        const params = {
            charset: "UTF-8",
            biz_content: encryptedBizContent,
            partner_id: this.config.partnerId,
            service: "instant_trade",
            request_no: CryptoUtils.generateRequestNo(),
            format: "JSON",
            sign_type: "RSA",
            version: "1.0",
            timestamp: CryptoUtils.generateTimestamp(),
            language: this.config.language,
        };

        // Generate signature
        params.sign = this.rsaManager.signData(params);

        // Encode parameters for form submission
        const encodedParams = this.encodeParameters(params);

        // Send request to PayPay API
        return await this.sendApiRequest(encodedParams);
    }

    /**
     * Validates MULTICAIXA payment input
     * @private
     */
    validateMulticaixaPaymentInput(orderDetails) {
        const required = ['outTradeNo', 'amount', 'phoneNum', 'paymentMethod'];
        const missing = required.filter(field => !orderDetails[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields for MULTICAIXA payment: ${missing.join(', ')}`);
        }

        if (typeof orderDetails.amount !== 'number' || orderDetails.amount <= 0) {
            throw new Error('Amount must be a positive number');
        }

        if (!['EXPRESS', 'REFERENCE'].includes(orderDetails.paymentMethod.toUpperCase())) {
            throw new Error('Payment method must be EXPRESS or REFERENCE');
        }
    }

    /**
     * Validates PayPay App payment input
     * @private
     */
    validatePayPayAppInput(orderDetails) {
        const required = ['outTradeNo', 'amount'];
        const missing = required.filter(field => !orderDetails[field]);

        if (missing.length > 0) {
            throw new Error(`Missing required fields for PayPay App payment: ${missing.join(', ')}`);
        }

        if (typeof orderDetails.amount !== 'number' || orderDetails.amount <= 0) {
            throw new Error('Amount must be a positive number');
        }
    }

    /**
     * Builds payment method configuration for MULTICAIXA
     * @private
     */
    buildMulticaixaPayMethod(amount, paymentMethod, phoneNum) {
        const method = paymentMethod.toUpperCase();

        if (method === 'EXPRESS') {
            return {
                pay_product_code: "31",
                amount: amount.toFixed(2),
                bank_code: "MUL",
                phone_num: phoneNum,
            };
        } else if (method === 'REFERENCE') {
            return {
                pay_product_code: "31",
                amount: amount.toFixed(2),
                bank_code: "REF",
            };
        }

        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    /**
     * Encodes parameters for form submission
     * @private
     */
    encodeParameters(params) {
        const encodedParams = {};
        Object.keys(params)
            .sort((a, b) => a.localeCompare(b))
            .forEach((key) => {
                encodedParams[key] = encodeURIComponent(params[key]);
            });
        return encodedParams;
    }

    /**
     * Sends request to PayPay API
     * @private
     */
    async sendApiRequest(encodedParams) {
        const response = await axios.post(
            this.config.apiUrl,
            qs.stringify(encodedParams),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 30000, // 30 second timeout
            }
        );

        return response.data;
    }

    /**
     * Normalizes PayPay API response to consistent format
     * @private
     */
    normalizePaymentResponse(response, outTradeNo) {
        // Check if response indicates success
        const isSuccess = response.is_success === 'T' || response.is_success === true;

        if (isSuccess) {
            return {
                success: true,
                data: {
                    dynamicLink: response.dynamic_link,
                    tradeToken: response.trade_token,
                    outTradeNo: outTradeNo,
                    innerTradeNo: response.inner_trade_no,
                    referenceId: response.reference_id,
                    entityId: response.entity_id,
                    totalAmount: parseFloat(response.total_amount || 0),
                    returnUrl: response.return_url,
                    qrCode: response.qr_code,
                    rawResponse: response
                }
            };
        } else {
            return {
                success: false,
                error: {
                    code: response.code || 'UNKNOWN_ERROR',
                    subCode: response.sub_code,
                    message: response.msg || 'Payment failed',
                    description: response.sub_msg,
                    rawResponse: response
                }
            };
        }
    }

    /**
     * Handles and formats payment errors
     * @private
     */
    handlePaymentError(error, operation) {
        if (error.response) {
            // API responded with error
            const apiError = error.response.data;
            return new Error(`${operation} failed: ${apiError.sub_msg || apiError.error_msg || 'API error'}`);
        } else if (error.request) {
            // Request failed to reach API
            return new Error(`${operation} failed: Unable to connect to PayPay API`);
        } else {
            // Other errors (validation, encryption, etc.)
            return new Error(`${operation} failed: ${error.message}`);
        }
    }

    /**
     * Gets client configuration (for debugging)
     * @returns {Object} Sanitized configuration
     */
    getConfig() {
        return {
            partnerId: this.config.partnerId,
            apiUrl: this.config.apiUrl,
            environment: this.config.environment,
            language: this.config.language,
            saleProductCode: this.config.saleProductCode
        };
    }
}

module.exports = PaymentClient;