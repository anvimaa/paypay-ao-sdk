import { PayPayError } from './PayPayError';
/**
 * Erro específico para falhas na comunicação com a API
 */
export declare class ApiError extends PayPayError {
    readonly statusCode: number;
    readonly apiResponse?: any;
    readonly requestData?: any;
    constructor(message: string, statusCode: number, apiResponse?: any, requestData?: any, code?: string, subCode?: string);
    /**
     * Cria um erro de API a partir de uma resposta de erro
     */
    static fromApiResponse(statusCode: number, apiResponse: any, requestData?: any): ApiError;
    /**
     * Cria um erro de conexão
     */
    static connectionError(originalError: Error, requestData?: any): ApiError;
    /**
     * Cria um erro de timeout
     */
    static timeout(requestData?: any): ApiError;
    /**
     * Cria um erro de resposta inválida
     */
    static invalidResponse(response: any, requestData?: any): ApiError;
    /**
     * Verifica se é um erro temporário que pode ser retemptado
     */
    isRetryable(): boolean;
    /**
     * Converte para JSON com informações específicas da API
     */
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=ApiError.d.ts.map