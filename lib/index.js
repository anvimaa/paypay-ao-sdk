const axios = require("axios");
const forge = require("node-forge");
const crypto = require("crypto");
const qs = require("qs");
const validator = require('validator');

/**
 * PayPay AO SDK - Cliente JavaScript para integração com a API PayPay
 * 
 * Este SDK fornece uma interface simplificada para interagir com os serviços de pagamento
 * da PayPay Africa, incluindo pagamentos via Multicaixa Express, referência bancária
 * e aplicação PayPay.
 * 
 */
class PayPaySDK {
    /**
     * Creates a new PayPay SDK instance
     * @param {Object} config - SDK configuration
     * @param {string} config.partnerId - Merchant partner ID
     * @param {string} config.privateKey - RSA private key in PEM format
     * @param {string} config.paypayPublicKey - PayPay public key in PEM format
     * @param {string} [config.language='pt'] - Language preference (pt/en)
     * @param {string} [config.saleProductCode] - Sale product code
     * @param {string} [config.apiUrl='https://gateway.paypayafrica.com/recv.do'] - The API URL
     */
    constructor(config) {
        this.config = {
            apiUrl: "https://gateway.paypayafrica.com/recv.do",
            saleProductCode: "050200001",
            language: "en",
            ...config,
        };
        this._validateConfig();
    }

    _validateConfig() {
        const { partnerId, privateKey, paypayPublicKey } = this.config;
        if (!partnerId) throw new Error("partnerId é obrigatório");
        if (!privateKey) throw new Error("privateKey é obrigatório");
        this._validatePemKey(privateKey, "PRIVATE KEY");
        console.log("SALE PRODUCT CODE: ", this.config.saleProductCode)
        console.log("PARTERNER ID: ", this.config.partnerId)
        if (paypayPublicKey) this._validatePemKey(paypayPublicKey, "PUBLIC KEY");
    }

    _validatePemKey(key, type = "PUBLIC KEY") {
        if (
            !key.includes(`-----BEGIN ${type}-----`) ||
            !key.includes(`-----END ${type}-----`)
        ) {
            throw new Error(`Formato inválido de ${type}: faltam headers PEM`);
        }
        try {
            if (type === "PRIVATE KEY") forge.pki.privateKeyFromPem(key);
            else forge.pki.publicKeyFromPem(key);
            return true;
        } catch (e) {
            throw new Error(`Falha ao parsear ${type}: ${e.message}`);
        }
    }

    _generateRequestNo() {
        return crypto.randomBytes(16).toString("hex");
    }

    _generateTimestamp() {
        const now = new Date();
        const offset = 1 * 60 * 60 * 1000; // GMT+1
        const gmtPlus1 = new Date(now.getTime() + offset);
        return gmtPlus1.toISOString().replace("T", " ").substring(0, 19);
    }

    _encryptBizContentWithPrivateKey(bizContent) {
        const buffer = Buffer.from(bizContent, "utf8");
        const chunkSize = 117; // para RSA-1024 com PKCS1
        const encryptedChunks = [];

        for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            const chunk = buffer.slice(offset, offset + chunkSize);
            const encrypted = crypto.privateEncrypt(
                {
                    key: this.config.privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                chunk
            );
            encryptedChunks.push(encrypted);
        }

        return Buffer.concat(encryptedChunks).toString("base64");
    }

    _generateSignature(params) {
        const sortedKeys = Object.keys(params)
            .filter((k) => k !== "sign" && k !== "sign_type")
            .sort();
        const stringToSign = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");

        const privateKeyObj = forge.pki.privateKeyFromPem(this.config.privateKey);
        const md = forge.md.sha1.create();
        md.update(stringToSign, "utf8");
        const signature = privateKeyObj.sign(md);
        return forge.util.encode64(signature);
    }

    async _send(service, bizContentObj) {
        const bizContent = this._encryptBizContentWithPrivateKey(
            JSON.stringify(bizContentObj)
        );

        const params = {
            charset: "UTF-8",
            biz_content: bizContent,
            partner_id: this.config.partnerId,
            service,
            request_no: this._generateRequestNo(),
            format: "JSON",
            sign_type: "RSA",
            version: "1.0",
            timestamp: this._generateTimestamp(),
            language: this.config.language,
        };

        params.sign = this._generateSignature(params);

        // Pré-encode dos valores (conforme seu código)
        const encodedParams = {};
        Object.keys(params)
            .sort((a, b) => a.localeCompare(b))
            .forEach((key) => {
                encodedParams[key] = encodeURIComponent(params[key]);
            });

        // Evita double-encoding no qs.stringify
        const body = qs.stringify(encodedParams);

        try {
            const resp = await axios.post(this.config.apiUrl, body, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            return resp.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.sub_msg || "Erro da API PayPay");
            }
            throw new Error(`Falha ao conectar à API PayPay: ${error.message}`);
        }
    }

    async createPayment({ outTradeNo, amount, phoneNum, subject = "Purchase", payerIp, paymentMethod }) {
        const mul_pay_method = {
            pay_product_code: "31",
            amount: Number(amount).toFixed(2),
            bank_code: "MUL",
            phone_num: phoneNum,
        };

        const ref_pay_method = {
            pay_product_code: "31",
            amount: Number(amount).toFixed(2),
            bank_code: "REF",
        };

        const bizContent = {
            cashier_type: "SDK",
            payer_ip: payerIp || "127.0.0.1",
            sale_product_code: this.config.saleProductCode,
            timeout_express: "15m",
            trade_info: {
                currency: "AOA",
                out_trade_no: outTradeNo,
                payee_identity: this.config.partnerId,
                payee_identity_type: "1",
                price: Number(amount).toFixed(2),
                quantity: "1",
                subject,
                total_amount: Number(amount).toFixed(2),
            },
            pay_method: paymentMethod === "EXPRESS" ? mul_pay_method : ref_pay_method,
        };

        return this._send("instant_trade", bizContent);
    }

    async createMulticaixaPayment({ outTradeNo, amount, phoneNum, subject = "Purchase", payerIp }) {
        if (!phoneNum) throw new Error("phoneNum é obrigatório para Multicaixa Express");
        return this.createPayment({ outTradeNo, amount, phoneNum, subject, payerIp, paymentMethod: "EXPRESS" });
    }

    async createReferencePayment({ outTradeNo, amount, subject = "Purchase", payerIp }) {
        return this.createPayment({ outTradeNo, amount, subject, payerIp, paymentMethod: "REFERENCE" });
    }

    async createPayPayAppPayment({ outTradeNo, amount, subject = "Purchase", payerIp }) {
        const bizContent = {
            cashier_type: "SDK",
            payer_ip: payerIp || "127.0.0.1",
            sale_product_code: this.config.saleProductCode,
            timeout_express: "15m",
            trade_info: {
                currency: "AOA",
                out_trade_no: outTradeNo,
                payee_identity: this.config.partnerId,
                payee_identity_type: "1",
                price: Number(amount).toFixed(2),
                quantity: "1",
                subject,
                total_amount: Number(amount).toFixed(2),
            },
        };
        return this._send("instant_trade", bizContent);
    }

    /**
     * Consulta o status de um pedido de pagamento
     * 
     * Este método permite verificar o status atual de um pedido de pagamento
     * usando o número único do pedido do comerciante (out_trade_no).
     * 
     * @async
     * @param {string} outTradeNo - Número único do pedido do comerciante para consulta
     * @returns {Promise<Object>} Resposta da API contendo informações do status do pedido
     * @throws {Error} Lança erro se outTradeNo não for fornecido ou se houver falha na comunicação com a API
     * 
     * @example
     * // Consultar status de um pedido
     * try {
     *   const status = await sdk.orderStatus('ORDER-123456789');
     *   console.log('Status do pedido:', status);
     *   
     *   if (status.code === '10000') {
     *     console.log('Status da transação:', status.trade_status);
     *   }
     * } catch (error) {
     *   console.error('Erro ao consultar status:', error.message);
     * }
     * 
     * @example
     * // Resposta típica de sucesso
     * {
     *   "code": "10000",
     *   "msg": "Success",
     *   "sub_code": "",
     *   "sub_msg": "",
     *   "trade_no": "2025010112345678",
     *   "out_trade_no": "ORDER-123456789",
     *   "trade_status": "TRADE_SUCCESS",
     *   "total_amount": "1000.50",
     *   "currency": "AOA",
     *   "gmt_payment": "2025-01-01 12:30:45"
     * }
     * 
     * @example
     * // Possíveis valores de trade_status:
     * // - WAIT_BUYER_PAY: Aguardando pagamento do comprador
     * // - TRADE_SUCCESS: Pagamento realizado com sucesso
     * // - TRADE_FINISHED: Transação finalizada
     * // - TRADE_CLOSED: Transação cancelada/fechada
     * 
     * @since 1.0.0
     */
    async orderStatus(outTradeNo) {

        const bizContent = {
            out_trade_no: outTradeNo,
        };

        return this._send("trade_query", bizContent);
    }

    /**
     * Cancela um pedido de pagamento
     * 
     * Este método permite cancelar um pedido de pagamento que ainda não foi processado.
     * O cancelamento só é possível para pedidos que estão em estado pendente.
     * 
     * @async
     * @param {string} outTradeNo - Número único do pedido do comerciante que será cancelado
     * @returns {Promise<Object>} Resposta da API contendo o resultado do cancelamento
     * @throws {Error} Lança erro se outTradeNo não for fornecido ou se houver falha na comunicação com a API
     * 
     * @example
     * // Cancelar um pedido
     * try {
     *   const result = await sdk.closeOrder('ORDER-123456789');
     *   console.log('Pedido cancelado:', result);
     * } catch (error) {
     *   console.error('Erro ao cancelar pedido:', error.message);
     * }
     * 
     * @example
     * // Resposta típica de sucesso
     * {
     *   "code": "10000",
     *   "msg": "Success",
     *   "sub_code": "",
     *   "sub_msg": "",
     *   "trade_no": "2025010112345678",
     *   "out_trade_no": "ORDER-123456789",
     *   "trade_status": "TRADE_CLOSED"
     * }
     * 
     * @since 1.0.0
     */
    async closeOrder(outTradeNo) {

        const bizContent = {
            out_trade_no: outTradeNo,
        };

        return this._send("trade_close", bizContent);
    }

    verifyResponseSignature(response) {
        if (!this.config.paypayPublicKey) {
            throw new Error("paypayPublicKey é obrigatório para verificar assinaturas");
        }
        try {
            const { sign, sign_type, ...params } = response;
            if (!sign) return false;

            const stringToVerify = Object.keys(params)
                .sort()
                .map((k) => `${k}=${params[k]}`)
                .join("&");

            const publicKey = forge.pki.publicKeyFromPem(this.config.paypayPublicKey);
            const md = forge.md.sha1.create();
            md.update(stringToVerify, "utf8");

            const signature = forge.util.decode64(sign);
            return publicKey.verify(md.digest().bytes(), signature);
        } catch (e) {
            return false;
        }
    }

    // Utils

    static generateUniqueOrderNo(prefix = "ORDER-") {
        return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

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
            minAmount = 1,
            maxAmount = 10000000000000,
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

    // Get IP By API
    static async getIp() {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            return `${response.data.ip}`;
        } catch (error) {
            // Fallback para uma API alternativa
            try {
                const response = await axios.get('https://httpbin.org/ip');
                return `${response.data.origin}`;
            } catch (fallbackError) {
                throw new Error(`Falha ao obter IP da máquina: ${fallbackError.message}`);
            }
        }
    }
}

module.exports = PayPaySDK;
