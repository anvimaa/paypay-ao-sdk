/**
 * PayPayAppPayment - Specialized handler for PayPay App payments
 * Provides focused functionality for PayPay mobile app payment processing
 */

const PaymentClient = require('./PaymentClient');

/**
 * PayPay App payment handler
 * Extends PaymentClient with PayPay App-specific functionality
 */
class PayPayAppPayment extends PaymentClient {
    constructor(config) {
        super(config);
        this.paymentType = 'PAYPAY_APP';
    }

    /**
     * Creates a PayPay App payment
     * @param {Object} orderDetails - Order details
     * @param {string} orderDetails.outTradeNo - Unique trade number
     * @param {number} orderDetails.amount - Payment amount
     * @param {string} [orderDetails.subject] - Payment description
     * @param {Object} [options] - Additional options
     * @param {string} [options.clientIp] - Client IP address
     * @param {string} [options.redirectUrl] - URL to redirect after payment
     * @returns {Promise<Object>} Payment response with app link
     */
    async createAppPayment(orderDetails, options = {}) {
        return await this.createPayPayAppPayment(orderDetails, options);
    }

    /**
     * Generates QR code data for PayPay App
     * @param {string} dynamicLink - Dynamic link from payment response
     * @returns {Object} QR code information
     */
    generateQRCodeData(dynamicLink) {
        return {
            qrCodeData: dynamicLink,
            format: 'QR_CODE',
            size: '256x256',
            instructions: {
                pt: 'Escaneie este código QR com o app PayPay para completar o pagamento',
                en: 'Scan this QR code with PayPay app to complete payment'
            }
        };
    }

    /**
     * Generates deep link for PayPay App
     * @param {string} dynamicLink - Dynamic link from payment response
     * @returns {Object} Deep link information
     */
    generateDeepLink(dynamicLink) {
        return {
            deepLink: dynamicLink,
            fallbackUrl: dynamicLink,
            instructions: {
                pt: 'Toque aqui para abrir no app PayPay',
                en: 'Tap here to open in PayPay app'
            }
        };
    }

    /**
     * Validates payment amount for PayPay App
     * @param {number} amount - Amount to validate
     * @returns {Object} Validation result
     */
    static validateAmount(amount) {
        const minAmount = 100; // 100 AOA minimum
        const maxAmount = 1000000; // 1M AOA maximum
        
        const validation = {
            isValid: true,
            errors: []
        };

        if (typeof amount !== 'number') {
            validation.isValid = false;
            validation.errors.push('Amount must be a number');
        }

        if (amount < minAmount) {
            validation.isValid = false;
            validation.errors.push(`Amount must be at least ${minAmount} AOA`);
        }

        if (amount > maxAmount) {
            validation.isValid = false;
            validation.errors.push(`Amount cannot exceed ${maxAmount} AOA`);
        }

        return validation;
    }

    /**
     * Gets payment flow steps for PayPay App
     * @param {string} [language='pt'] - Language for instructions
     * @returns {Object} Payment flow steps
     */
    static getPaymentFlow(language = 'pt') {
        const flows = {
            pt: {
                steps: [
                    'Crie o pagamento usando o SDK',
                    'Apresente o QR Code ou link dinâmico ao cliente',
                    'Cliente escaneia QR ou abre link no app PayPay',
                    'Cliente confirma pagamento no app',
                    'Receba notificação de confirmação via callback'
                ],
                title: 'Fluxo de Pagamento PayPay App'
            },
            en: {
                steps: [
                    'Create payment using SDK',
                    'Present QR Code or dynamic link to customer',
                    'Customer scans QR or opens link in PayPay app',
                    'Customer confirms payment in app',
                    'Receive confirmation via callback notification'
                ],
                title: 'PayPay App Payment Flow'
            }
        };

        return flows[language] || flows.pt;
    }

    /**
     * Gets integration options for different platforms
     * @returns {Object} Integration options
     */
    static getIntegrationOptions() {
        return {
            web: {
                qrCode: {
                    recommended: true,
                    description: 'Display QR code for mobile users to scan',
                    implementation: 'Generate QR code from dynamic link'
                },
                redirectLink: {
                    recommended: true,
                    description: 'Direct link for desktop users',
                    implementation: 'Use dynamic link as href'
                }
            },
            mobile: {
                deepLink: {
                    recommended: true,
                    description: 'Direct app-to-app navigation',
                    implementation: 'Use dynamic link as deep link URL'
                },
                fallback: {
                    recommended: true,
                    description: 'Fallback for users without app',
                    implementation: 'Redirect to app store or web payment'
                }
            },
            api: {
                webhook: {
                    recommended: true,
                    description: 'Real-time payment status updates',
                    implementation: 'Configure callback URL in merchant settings'
                },
                polling: {
                    recommended: false,
                    description: 'Manual status checking',
                    implementation: 'Periodically check payment status'
                }
            }
        };
    }

    /**
     * Gets supported currencies for PayPay App
     * @returns {string[]} Array of supported currencies
     */
    static getSupportedCurrencies() {
        return ['AOA']; // Currently only Angola Kwanza
    }

    /**
     * Gets payment timeout information
     * @returns {Object} Timeout information
     */
    static getTimeoutInfo() {
        return {
            default: '15m',
            maximum: '30m',
            minimum: '5m',
            description: 'Payment link expires after specified time'
        };
    }
}

module.exports = PayPayAppPayment;