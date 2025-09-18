/**
 * Classe base para erros do PayPay SDK
 */
export declare class PayPayError extends Error {
    readonly code?: string;
    readonly subCode?: string;
    readonly details?: any;
    constructor(message: string, code?: string, subCode?: string, details?: any);
    /**
     * Converte o erro para formato JSON
     */
    toJSON(): Record<string, any>;
    /**
     * Verifica se é um erro de sucesso da API
     */
    static isSuccess(code: string): boolean;
}
//# sourceMappingURL=PayPayError.d.ts.map