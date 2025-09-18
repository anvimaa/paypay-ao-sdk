"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPaySDK = void 0;
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("qs"));
const types_1 = require("./types");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
/**
 * PayPay AO SDK - Cliente TypeScript para integração com a API PayPay
 *
 * Este SDK fornece uma interface tipada e simplificada para interagir com os serviços
 * de pagamento da PayPay Africa, incluindo pagamentos via Multicaixa Express,
 * referência bancária e aplicação PayPay.
 */
class PayPaySDK {
    /**
     * Cria uma nova instância do PayPay SDK
     */
    constructor(config, options = {}) {
        this.config = {
            apiUrl: types_1.PAYMENT_CONSTANTS.DEFAULT_API_URL,
            saleProductCode: types_1.PAYMENT_CONSTANTS.DEFAULT_SALE_PRODUCT_CODE,
            language: types_1.PAYMENT_CONSTANTS.DEFAULT_LANGUAGE,
            paypayPublicKey: '',
            ...config,
        };
        this.options = {
            timeout: 30000,
            retryAttempts: 3,
            environment: 'production',
            ...options
        };
        this._validateConfig();
    }
    /**
     * Valida a configuração fornecida
     */
    _validateConfig() {
        const { partnerId, privateKey, paypayPublicKey } = this.config;
        if (!partnerId) {
            throw new errors_1.ValidationError('partnerId', partnerId, 'non-empty string');
        }
        if (!privateKey) {
            throw new errors_1.ValidationError('privateKey', privateKey, 'PEM formatted private key');
        }
        utils_1.CryptoUtils.validatePemKey(privateKey, 'PRIVATE KEY');
        if (paypayPublicKey) {
            utils_1.CryptoUtils.validatePemKey(paypayPublicKey, 'PUBLIC KEY');
        }
    }
    /**
     * Cria um pagamento genérico
     */
    async createPayment(request) {
        const { outTradeNo, amount, subject = 'Purchase', payerIp, paymentMethod } = request;
        const phoneNum = 'phoneNum' in request ? request.phoneNum : undefined;
        // Validar entrada
        utils_1.Validators.validate('outTradeNo', outTradeNo, utils_1.Validators.validateTradeNumber);
        utils_1.Validators.validate('amount', amount, utils_1.Validators.validateAmount);
        if (subject) {
            utils_1.Validators.validate('subject', subject, utils_1.Validators.validateSubject);
        }
        const resolvedPayerIp = payerIp || await utils_1.Helpers.getPublicIp();
        utils_1.Validators.validate('payerIp', resolvedPayerIp, utils_1.Validators.validateIP);
        // Criar método de pagamento baseado no tipo
        let payMethod;
        if (paymentMethod === 'EXPRESS') {
            if (!phoneNum) {
                throw new errors_1.ValidationError('phoneNum', phoneNum, 'valid Angola phone number for EXPRESS payment');
            }
            const phoneValidation = utils_1.Validators.validateAngolaPhoneNumber(phoneNum);
            if (!phoneValidation.isValid) {
                throw new errors_1.ValidationError('phoneNum', phoneNum, 'valid Angola phone number', phoneValidation.errors.join('; '));
            }
            payMethod = {
                pay_product_code: '31',
                amount: Number(amount).toFixed(2),
                bank_code: 'MUL',
                phone_num: phoneValidation.formatted,
            };
        }
        else if (paymentMethod === 'REFERENCE') {
            payMethod = {
                pay_product_code: '31',
                amount: Number(amount).toFixed(2),
                bank_code: 'REF',
            };
        }
        const tradeInfo = {
            currency: 'AOA',
            out_trade_no: outTradeNo,
            payee_identity: this.config.partnerId,
            payee_identity_type: '1',
            price: Number(amount).toFixed(2),
            quantity: '1',
            subject: subject || 'Purchase',
            total_amount: Number(amount).toFixed(2),
        };
        const bizContent = {
            cashier_type: 'SDK',
            payer_ip: resolvedPayerIp,
            sale_product_code: this.config.saleProductCode,
            timeout_express: types_1.PAYMENT_CONSTANTS.DEFAULT_TIMEOUT,
            trade_info: tradeInfo,
        };
        if (payMethod) {
            bizContent.pay_method = payMethod;
        }
        return this._send('instant_trade', bizContent);
    }
    /**
     * Cria um pagamento MULTICAIXA Express
     */
    async createMulticaixaPayment(request) {
        if (!request.phoneNum) {
            throw new errors_1.ValidationError('phoneNum', request.phoneNum, 'valid Angola phone number for Multicaixa Express');
        }
        return this.createPayment({
            ...request,
            paymentMethod: 'EXPRESS'
        });
    }
    /**
     * Cria um pagamento por referência
     */
    async createReferencePayment(request) {
        return this.createPayment({
            ...request,
            paymentMethod: 'REFERENCE'
        });
    }
    /**
     * Cria um pagamento via PayPay App
     */
    async createPayPayAppPayment(request) {
        const { outTradeNo, amount, subject = 'Purchase', payerIp } = request;
        // Validar entrada
        utils_1.Validators.validate('outTradeNo', outTradeNo, utils_1.Validators.validateTradeNumber);
        utils_1.Validators.validate('amount', amount, utils_1.Validators.validateAmount);
        if (subject) {
            utils_1.Validators.validate('subject', subject, utils_1.Validators.validateSubject);
        }
        const resolvedPayerIp = payerIp || await utils_1.Helpers.getPublicIp();
        utils_1.Validators.validate('payerIp', resolvedPayerIp, utils_1.Validators.validateIP);
        const tradeInfo = {
            currency: 'AOA',
            out_trade_no: outTradeNo,
            payee_identity: this.config.partnerId,
            payee_identity_type: '1',
            price: Number(amount).toFixed(2),
            quantity: '1',
            subject: subject || 'Purchase',
            total_amount: Number(amount).toFixed(2),
        };
        const bizContent = {
            cashier_type: 'SDK',
            payer_ip: resolvedPayerIp,
            sale_product_code: this.config.saleProductCode,
            timeout_express: types_1.PAYMENT_CONSTANTS.DEFAULT_TIMEOUT,
            trade_info: tradeInfo,
        };
        return this._send('instant_trade', bizContent);
    }
    /**
     * Consulta o status de um pedido de pagamento
     */
    async orderStatus(outTradeNo) {
        utils_1.Validators.validate('outTradeNo', outTradeNo, utils_1.Validators.validateTradeNumber);
        const bizContent = {
            out_trade_no: outTradeNo,
        };
        return this._send('trade_query', bizContent);
    }
    /**
     * Cancela um pedido de pagamento
     */
    async closeOrder(outTradeNo) {
        utils_1.Validators.validate('outTradeNo', outTradeNo, utils_1.Validators.validateTradeNumber);
        const bizContent = {
            out_trade_no: outTradeNo,
        };
        return this._send('trade_close', bizContent);
    }
    /**
     * Verifica a assinatura de uma resposta
     */
    verifyResponseSignature(response) {
        if (!this.config.paypayPublicKey) {
            throw new errors_1.PayPayError('paypayPublicKey é obrigatório para verificar assinaturas');
        }
        const { sign } = response;
        if (!sign) {
            return false;
        }
        return utils_1.CryptoUtils.verifySignature(response, sign, this.config.paypayPublicKey);
    }
    /**
     * Envia requisição para a API
     */
    async _send(service, bizContentObj) {
        const bizContent = utils_1.CryptoUtils.encryptWithPrivateKey(JSON.stringify(bizContentObj), this.config.privateKey);
        const params = {
            charset: 'UTF-8',
            biz_content: bizContent,
            partner_id: this.config.partnerId,
            service,
            request_no: utils_1.CryptoUtils.generateRequestNo(),
            format: 'JSON',
            sign_type: 'RSA',
            version: '1.0',
            timestamp: utils_1.CryptoUtils.generateTimestamp(),
            language: this.config.language,
        };
        params.sign = utils_1.CryptoUtils.generateSignature(params, this.config.privateKey);
        // Codificar parâmetros
        const encodedParams = {};
        Object.keys(params)
            .sort((a, b) => a.localeCompare(b))
            .forEach((key) => {
            const value = params[key];
            if (value !== undefined) {
                encodedParams[key] = encodeURIComponent(String(value));
            }
        });
        const body = qs.stringify(encodedParams);
        try {
            const response = await axios_1.default.post(this.config.apiUrl, body, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: this.options.timeout,
            });
            const apiResponse = response.data;
            // Verificar se houve erro na resposta
            if (apiResponse.code && !types_1.PAYMENT_CONSTANTS.SUCCESS_CODES.includes(apiResponse.code)) {
                throw (0, errors_1.createErrorFromApiResponse)(apiResponse);
            }
            return apiResponse;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response) {
                    throw errors_1.ApiError.fromApiResponse(error.response.status, error.response.data, { service, bizContent: bizContentObj });
                }
                else if (error.code === 'ECONNABORTED') {
                    throw errors_1.ApiError.timeout({ service, bizContent: bizContentObj });
                }
                else {
                    throw errors_1.ApiError.connectionError(error, { service, bizContent: bizContentObj });
                }
            }
            throw error;
        }
    }
    /**
     * Obtém a configuração atual (apenas leitura)
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Obtém as opções atuais (apenas leitura)
     */
    getOptions() {
        return { ...this.options };
    }
    // Métodos estáticos para compatibilidade
    /**
     * Gera um número único de pedido
     */
    static generateUniqueOrderNo(prefix) {
        return utils_1.CryptoUtils.generateUniqueOrderNo(prefix);
    }
}
exports.PayPaySDK = PayPaySDK;
/**
 * Valida número de telefone angolano
 */
PayPaySDK.validateAngolaPhoneNumber = utils_1.Validators.validateAngolaPhoneNumber;
/**
 * Valida valor de pagamento
 */
PayPaySDK.validateAmount = utils_1.Validators.validateAmount;
/**
 * Valida número de transação
 */
PayPaySDK.validateTradeNumber = utils_1.Validators.validateTradeNumber;
/**
 * Valida email
 */
PayPaySDK.validateEmail = utils_1.Validators.validateEmail;
/**
 * Valida IP
 */
PayPaySDK.validateIP = utils_1.Validators.validateIP;
/**
 * Valida URL
 */
PayPaySDK.validateURL = utils_1.Validators.validateURL;
/**
 * Valida assunto
 */
PayPaySDK.validateSubject = utils_1.Validators.validateSubject;
/**
 * Obtém IP público
 */
PayPaySDK.getIp = utils_1.Helpers.getPublicIp;
//# sourceMappingURL=PayPaySDK.js.map