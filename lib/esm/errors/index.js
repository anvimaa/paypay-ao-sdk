/**
 * Exportações centralizadas das classes de erro
 */
export { PayPayError } from './PayPayError';
export { ValidationError } from './ValidationError';
export { ApiError } from './ApiError';
// Importar tipos para usar nas type guards
import { PayPayError } from './PayPayError';
import { ValidationError } from './ValidationError';
import { ApiError } from './ApiError';
/**
 * Type guard para verificar se um erro é do tipo PayPayError
 */
export function isPayPayError(error) {
    return error instanceof PayPayError;
}
/**
 * Type guard para verificar se um erro é do tipo ValidationError
 */
export function isValidationError(error) {
    return error instanceof ValidationError;
}
/**
 * Type guard para verificar se um erro é do tipo ApiError
 */
export function isApiError(error) {
    return error instanceof ApiError;
}
/**
 * Utilitário para criar erros baseados em códigos de resposta da API
 */
export function createErrorFromApiResponse(response) {
    if (!response.code || response.code === '10000') {
        // Não é um erro
        return new PayPayError('Unexpected error creation for successful response');
    }
    // Mapeamento de códigos de erro conhecidos
    const errorMappings = {
        '20000': 'Serviço temporariamente indisponível',
        '20001': 'Parâmetros de entrada insuficientes',
        '40001': 'Parâmetros de entrada ausentes',
        '40002': 'Parâmetros de entrada inválidos',
        '40003': 'Formato de dados inválido',
        '40004': 'Assinatura inválida',
        '40005': 'Chave de criptografia inválida',
        '50000': 'Erro interno do sistema',
        '50001': 'Erro de processamento de pagamento'
    };
    const message = response.sub_msg ||
        errorMappings[response.code] ||
        response.msg ||
        'Erro desconhecido da API';
    return new PayPayError(message, response.code, response.sub_code, response);
}
//# sourceMappingURL=index.js.map