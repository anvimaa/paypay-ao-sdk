import { ValidationResult, PhoneValidationResult, AmountValidationOptions } from '../types';
/**
 * Utilitários de validação para o PayPay SDK
 */
export declare class Validators {
    /**
     * Valida número de telefone angolano
     */
    static validateAngolaPhoneNumber(phoneNum: unknown): PhoneValidationResult;
    /**
     * Valida valor de pagamento
     */
    static validateAmount(amount: unknown, options?: AmountValidationOptions): ValidationResult<number>;
    /**
     * Valida número de transação
     */
    static validateTradeNumber(tradeNo: unknown): ValidationResult<string>;
    /**
     * Valida endereço de email
     */
    static validateEmail(email: unknown): ValidationResult<string>;
    /**
     * Valida endereço IP
     */
    static validateIP(ip: unknown): ValidationResult<string>;
    /**
     * Valida formato de URL
     */
    static validateURL(url: unknown): ValidationResult<string>;
    /**
     * Valida assunto/descrição do pagamento
     */
    static validateSubject(subject: unknown): ValidationResult<string>;
    /**
     * Valida e lança erro se inválido
     */
    static validate<T>(field: string, value: unknown, validator: (val: unknown) => ValidationResult<T>): T;
}
//# sourceMappingURL=validators.d.ts.map