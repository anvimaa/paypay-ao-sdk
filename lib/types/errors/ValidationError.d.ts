import { PayPayError } from './PayPayError';
/**
 * Erro de validação específico para o PayPay SDK
 */
export declare class ValidationError extends PayPayError {
    readonly field: string;
    readonly value: any;
    readonly expectedFormat: string;
    constructor(field: string, value: any, expectedFormat: string, customMessage?: string);
    /**
     * Cria um erro de validação para campo obrigatório
     */
    static required(field: string): ValidationError;
    /**
     * Cria um erro de validação para tipo inválido
     */
    static invalidType(field: string, value: any, expectedType: string): ValidationError;
    /**
     * Cria um erro de validação para formato inválido
     */
    static invalidFormat(field: string, value: any, format: string): ValidationError;
    /**
     * Cria um erro de validação para valor fora do intervalo
     */
    static outOfRange(field: string, value: any, min?: number, max?: number): ValidationError;
    /**
     * Converte para JSON com informações específicas de validação
     */
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=ValidationError.d.ts.map