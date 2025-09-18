import axios from 'axios';
import * as qs from 'qs';
import { PAYMENT_CONSTANTS } from './types';
import { PayPayError, ValidationError, ApiError, createErrorFromApiResponse } from './errors';
import { CryptoUtils, Validators, Helpers } from './utils';
/**
 * PayPay AO SDK - Cliente TypeScript para integração com a API PayPay
 *
 * Este SDK fornece uma interface tipada e simplificada para interagir com os serviços
 * de pagamento da PayPay Africa, incluindo pagamentos via Multicaixa Express,
 * referência bancária e aplicação PayPay.
 */
export class PayPaySDK {
    /**
     * Cria uma nova instância do PayPay SDK
     */
    constructor(config, options = {}) {
        this.config = {
            apiUrl: PAYMENT_CONSTANTS.DEFAULT_API_URL,
            saleProductCode: PAYMENT_CONSTANTS.DEFAULT_SALE_PRODUCT_CODE,
            language: PAYMENT_CONSTANTS.DEFAULT_LANGUAGE,
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
            throw new ValidationError('partnerId', partnerId, 'non-empty string');
        }
        if (!privateKey) {
            throw new ValidationError('privateKey', privateKey, 'PEM formatted private key');
        }
        CryptoUtils.validatePemKey(privateKey, 'PRIVATE KEY');
        if (paypayPublicKey) {
            CryptoUtils.validatePemKey(paypayPublicKey, 'PUBLIC KEY');
        }
    }
    /**
     * Cria um pagamento genérico
     */
    async createPayment(request) {
        const { outTradeNo, amount, subject = 'Purchase', payerIp, paymentMethod } = request;
        const phoneNum = 'phoneNum' in request ? request.phoneNum : undefined;
        // Validar entrada
        Validators.validate('outTradeNo', outTradeNo, Validators.validateTradeNumber);
        Validators.validate('amount', amount, Validators.validateAmount);
        if (subject) {
            Validators.validate('subject', subject, Validators.validateSubject);
        }
        const resolvedPayerIp = payerIp || await Helpers.getPublicIp();
        Validators.validate('payerIp', resolvedPayerIp, Validators.validateIP);
        // Criar método de pagamento baseado no tipo
        let payMethod;
        if (paymentMethod === 'EXPRESS') {
            if (!phoneNum) {
                throw new ValidationError('phoneNum', phoneNum, 'valid Angola phone number for EXPRESS payment');
            }
            const phoneValidation = Validators.validateAngolaPhoneNumber(phoneNum);
            if (!phoneValidation.isValid) {
                throw new ValidationError('phoneNum', phoneNum, 'valid Angola phone number', phoneValidation.errors.join('; '));
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
            timeout_express: PAYMENT_CONSTANTS.DEFAULT_TIMEOUT,
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
            throw new ValidationError('phoneNum', request.phoneNum, 'valid Angola phone number for Multicaixa Express');
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
        Validators.validate('outTradeNo', outTradeNo, Validators.validateTradeNumber);
        Validators.validate('amount', amount, Validators.validateAmount);
        if (subject) {
            Validators.validate('subject', subject, Validators.validateSubject);
        }
        const resolvedPayerIp = payerIp || await Helpers.getPublicIp();
        Validators.validate('payerIp', resolvedPayerIp, Validators.validateIP);
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
            timeout_express: PAYMENT_CONSTANTS.DEFAULT_TIMEOUT,
            trade_info: tradeInfo,
        };
        return this._send('instant_trade', bizContent);
    }
    /**
     * Consulta o status de um pedido de pagamento
     */
    async orderStatus(outTradeNo) {
        Validators.validate('outTradeNo', outTradeNo, Validators.validateTradeNumber);
        const bizContent = {
            out_trade_no: outTradeNo,
        };
        return this._send('trade_query', bizContent);
    }
    /**
     * Cancela um pedido de pagamento
     */
    async closeOrder(outTradeNo) {
        Validators.validate('outTradeNo', outTradeNo, Validators.validateTradeNumber);
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
            throw new PayPayError('paypayPublicKey é obrigatório para verificar assinaturas');
        }
        const { sign } = response;
        if (!sign) {
            return false;
        }
        return CryptoUtils.verifySignature(response, sign, this.config.paypayPublicKey);
    }
    /**
     * Envia requisição para a API
     */
    async _send(service, bizContentObj) {
        const bizContent = CryptoUtils.encryptWithPrivateKey(JSON.stringify(bizContentObj), this.config.privateKey);
        const params = {
            charset: 'UTF-8',
            biz_content: bizContent,
            partner_id: this.config.partnerId,
            service,
            request_no: CryptoUtils.generateRequestNo(),
            format: 'JSON',
            sign_type: 'RSA',
            version: '1.0',
            timestamp: CryptoUtils.generateTimestamp(),
            language: this.config.language,
        };
        params.sign = CryptoUtils.generateSignature(params, this.config.privateKey);
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
            const response = await axios.post(this.config.apiUrl, body, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: this.options.timeout,
            });
            const apiResponse = response.data;
            // Verificar se houve erro na resposta
            if (apiResponse.code && !PAYMENT_CONSTANTS.SUCCESS_CODES.includes(apiResponse.code)) {
                throw createErrorFromApiResponse(apiResponse);
            }
            return apiResponse;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    throw ApiError.fromApiResponse(error.response.status, error.response.data, { service, bizContent: bizContentObj });
                }
                else if (error.code === 'ECONNABORTED') {
                    throw ApiError.timeout({ service, bizContent: bizContentObj });
                }
                else {
                    throw ApiError.connectionError(error, { service, bizContent: bizContentObj });
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
        return CryptoUtils.generateUniqueOrderNo(prefix);
    }
}
/**
 * Valida número de telefone angolano
 */
PayPaySDK.validateAngolaPhoneNumber = Validators.validateAngolaPhoneNumber;
/**
 * Valida valor de pagamento
 */
PayPaySDK.validateAmount = Validators.validateAmount;
/**
 * Valida número de transação
 */
PayPaySDK.validateTradeNumber = Validators.validateTradeNumber;
/**
 * Valida email
 */
PayPaySDK.validateEmail = Validators.validateEmail;
/**
 * Valida IP
 */
PayPaySDK.validateIP = Validators.validateIP;
/**
 * Valida URL
 */
PayPaySDK.validateURL = Validators.validateURL;
/**
 * Valida assunto
 */
PayPaySDK.validateSubject = Validators.validateSubject;
/**
 * Obtém IP público
 */
PayPaySDK.getIp = Helpers.getPublicIp;
//# sourceMappingURL=PayPaySDK.js.map