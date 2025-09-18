import validator from 'validator';
import { PAYMENT_CONSTANTS } from '../types';
import { ValidationError } from '../errors';
/**
 * Utilitários de validação para o PayPay SDK
 */
export class Validators {
    /**
     * Valida número de telefone angolano
     */
    static validateAngolaPhoneNumber(phoneNum) {
        const result = {
            isValid: false,
            formatted: undefined,
            errors: []
        };
        if (!phoneNum || typeof phoneNum !== 'string') {
            result.errors.push('Phone number is required and must be a string');
            return result;
        }
        // Limpar o número de telefone
        const cleaned = phoneNum.replace(/[\s\-\(\)]/g, '');
        // Testar padrões de telefone angolano
        let isValid = false;
        let formatted = cleaned;
        for (const pattern of PAYMENT_CONSTANTS.ANGOLA_PHONE_PATTERNS) {
            if (pattern.test(cleaned)) {
                isValid = true;
                // Garantir prefixo 244 para números válidos
                if (cleaned.startsWith('9')) {
                    formatted = '244' + cleaned;
                }
                else {
                    formatted = cleaned;
                }
                break;
            }
        }
        if (!isValid) {
            result.errors.push('Invalid Angola phone number format. Expected: 244XXXXXXXXX or 9XXXXXXXX');
        }
        else {
            result.isValid = true;
            result.formatted = formatted;
            // Extrair código do país e número nacional
            if (formatted.startsWith('244')) {
                result.countryCode = '244';
                result.nationalNumber = formatted.substring(3);
            }
        }
        return result;
    }
    /**
     * Valida valor de pagamento
     */
    static validateAmount(amount, options = {}) {
        const { minAmount = PAYMENT_CONSTANTS.MIN_AMOUNT, maxAmount = PAYMENT_CONSTANTS.MAX_AMOUNT, currency = 'AOA' } = options;
        const result = {
            isValid: false,
            formatted: undefined,
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
        // Validar casas decimais (máximo 2 para moeda)
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
     * Valida número de transação
     */
    static validateTradeNumber(tradeNo) {
        const result = {
            isValid: false,
            formatted: undefined,
            errors: []
        };
        if (!tradeNo || typeof tradeNo !== 'string') {
            result.errors.push('Trade number is required and must be a string');
            return result;
        }
        if (tradeNo.length < PAYMENT_CONSTANTS.MIN_TRADE_NO_LENGTH ||
            tradeNo.length > PAYMENT_CONSTANTS.MAX_TRADE_NO_LENGTH) {
            result.errors.push(`Trade number must be between ${PAYMENT_CONSTANTS.MIN_TRADE_NO_LENGTH} and ${PAYMENT_CONSTANTS.MAX_TRADE_NO_LENGTH} characters`);
            return result;
        }
        // Permitir alfanuméricos, traço e underscore
        if (!/^[a-zA-Z0-9\-_]+$/.test(tradeNo)) {
            result.errors.push('Trade number can only contain letters, numbers, dashes, and underscores');
            return result;
        }
        result.isValid = true;
        result.formatted = tradeNo;
        return result;
    }
    /**
     * Valida endereço de email
     */
    static validateEmail(email) {
        const result = {
            isValid: false,
            formatted: undefined,
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
        result.formatted = email.toLowerCase().trim();
        return result;
    }
    /**
     * Valida endereço IP
     */
    static validateIP(ip) {
        const result = {
            isValid: false,
            formatted: undefined,
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
        result.formatted = ip;
        return result;
    }
    /**
     * Valida formato de URL
     */
    static validateURL(url) {
        const result = {
            isValid: false,
            formatted: undefined,
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
        result.formatted = url;
        return result;
    }
    /**
     * Valida assunto/descrição do pagamento
     */
    static validateSubject(subject) {
        const result = {
            isValid: false,
            formatted: undefined,
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
        // Remover caracteres perigosos
        const sanitized = subject.replace(/[<>'"&]/g, '');
        if (sanitized !== subject) {
            result.errors.push('Subject contains invalid characters');
            return result;
        }
        result.isValid = true;
        result.formatted = subject.trim();
        return result;
    }
    /**
     * Valida e lança erro se inválido
     */
    static validate(field, value, validator) {
        const result = validator(value);
        if (!result.isValid) {
            throw new ValidationError(field, value, 'valid format', result.errors.join('; '));
        }
        return result.formatted;
    }
}
//# sourceMappingURL=validators.js.map