"use strict";
/**
 * Exportações centralizadas das classes de erro
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ValidationError = exports.PayPayError = void 0;
exports.isPayPayError = isPayPayError;
exports.isValidationError = isValidationError;
exports.isApiError = isApiError;
exports.createErrorFromApiResponse = createErrorFromApiResponse;
var PayPayError_1 = require("./PayPayError");
Object.defineProperty(exports, "PayPayError", { enumerable: true, get: function () { return PayPayError_1.PayPayError; } });
var ValidationError_1 = require("./ValidationError");
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return ValidationError_1.ValidationError; } });
var ApiError_1 = require("./ApiError");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return ApiError_1.ApiError; } });
// Importar tipos para usar nas type guards
const PayPayError_2 = require("./PayPayError");
const ValidationError_2 = require("./ValidationError");
const ApiError_2 = require("./ApiError");
/**
 * Type guard para verificar se um erro é do tipo PayPayError
 */
function isPayPayError(error) {
    return error instanceof PayPayError_2.PayPayError;
}
/**
 * Type guard para verificar se um erro é do tipo ValidationError
 */
function isValidationError(error) {
    return error instanceof ValidationError_2.ValidationError;
}
/**
 * Type guard para verificar se um erro é do tipo ApiError
 */
function isApiError(error) {
    return error instanceof ApiError_2.ApiError;
}
/**
 * Utilitário para criar erros baseados em códigos de resposta da API
 */
function createErrorFromApiResponse(response) {
    if (!response.code || response.code === '10000') {
        // Não é um erro
        return new PayPayError_2.PayPayError('Unexpected error creation for successful response');
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
    return new PayPayError_2.PayPayError(message, response.code, response.sub_code, response);
}
//# sourceMappingURL=index.js.map