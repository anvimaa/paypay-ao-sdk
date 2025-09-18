/**
 * Exportações centralizadas das classes de erro
 */
export { PayPayError } from './PayPayError';
export { ValidationError } from './ValidationError';
export { ApiError } from './ApiError';
import { PayPayError } from './PayPayError';
import { ValidationError } from './ValidationError';
import { ApiError } from './ApiError';
/**
 * Type guard para verificar se um erro é do tipo PayPayError
 */
export declare function isPayPayError(error: any): error is PayPayError;
/**
 * Type guard para verificar se um erro é do tipo ValidationError
 */
export declare function isValidationError(error: any): error is ValidationError;
/**
 * Type guard para verificar se um erro é do tipo ApiError
 */
export declare function isApiError(error: any): error is ApiError;
/**
 * Utilitário para criar erros baseados em códigos de resposta da API
 */
export declare function createErrorFromApiResponse(response: any): PayPayError;
//# sourceMappingURL=index.d.ts.map